#!/bin/bash
# ============================================================
# The Dietitian's Clinic — VPS Deployment Script
# For Hostinger KVM 1 (Ubuntu 22.04/24.04)
# ============================================================

set -e

DOMAIN="thedietitiansclinic.com"
REPO_URL="https://github.com/Khairey11/ashish-the-dietiations-clicnic.git"
APP_DIR="/opt/dietitians-clinic"

echo "============================================"
echo "  Deploying The Dietitian's Clinic"
echo "  Domain: $DOMAIN"
echo "============================================"
echo ""

# ===== Step 1: Install system dependencies =====
echo ">>> Step 1/8: Installing system dependencies..."
apt-get update -y
apt-get install -y curl git build-essential python3 ufw unzip
echo "✓ System packages installed"

# ===== Step 2: Install Node.js 20 LTS =====
echo ""
echo ">>> Step 2/8: Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "✓ Node.js $(node -v) installed"

# ===== Step 3: Install Bun =====
echo ""
echo ">>> Step 3/8: Installing Bun..."
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
  echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
fi
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
echo "✓ Bun installed: $(bun --version)"

# ===== Step 4: Install Caddy =====
echo ""
echo ">>> Step 4/8: Installing Caddy..."
if ! command -v caddy &> /dev/null; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi
echo "✓ Caddy installed"

# ===== Step 5: Clone/update the project =====
echo ""
echo ">>> Step 5/8: Cloning project..."
if [ -d "$APP_DIR" ]; then
  cd $APP_DIR
  git stash
  git pull origin main
else
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi
echo "✓ Project cloned"

# ===== Step 6: Install deps + build =====
echo ""
echo ">>> Step 6/8: Building project (this takes 2-3 minutes)..."

# Install dependencies
bun install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database (ignore errors if already seeded)
bun run scripts/seed.ts || true

# Generate secrets
SECRET=$(openssl rand -hex 32)
WEBHOOK_SECRET=$(openssl rand -hex 16)

# Create .env file
cat > .env << EOF
DATABASE_URL=file:$APP_DIR/db/custom.db
ADMIN_SESSION_SECRET=$SECRET
WEBHOOK_SECRET=$WEBHOOK_SECRET
RESEND_API_KEY=
FROM_EMAIL=care@$DOMAIN
APP_BASE_URL=https://$DOMAIN
EOF

# Build the project
NEXT_TELEMETRY_DISABLED=1 bun run build

# Copy static files to standalone (required by the build script)
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

echo "✓ Project built successfully"

# ===== Step 7: Configure Caddy =====
echo ""
echo ">>> Step 7/8: Configuring Caddy with auto-HTTPS..."

# Stop Caddy if running
systemctl stop caddy 2>/dev/null || true

cat > /etc/caddy/Caddyfile << EOF
$DOMAIN, www.$DOMAIN {
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Real-IP {remote_host}
    }

    encode gzip zstd

    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }

    @static path /_next/static/* /logo-transparent.png /uploads/*
    header @static Cache-Control "public, max-age=31536000, immutable"
}
EOF

# Restart Caddy
systemctl start caddy
systemctl enable caddy
echo "✓ Caddy configured for $DOMAIN"

# ===== Step 8: Create systemd service =====
echo ""
echo ">>> Step 8/8: Setting up systemd service..."

# Stop existing service if running
systemctl stop dietitians-clinic 2>/dev/null || true

BUN_PATH=$(which bun)

cat > /etc/systemd/system/dietitians-clinic.service << EOF
[Unit]
Description=The Dietitian's Clinic Next.js App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=$BUN_PATH .next/standalone/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=file:$APP_DIR/db/custom.db
Environment=BUN_INSTALL=$HOME/.bun
Environment=PATH=$HOME/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable dietitians-clinic
systemctl start dietitians-clinic
sleep 3

# Check if the app started
if systemctl is-active --quiet dietitians-clinic; then
  echo "✓ App is running on port 3000"
else
  echo "⚠️ App failed to start — checking logs..."
  journalctl -u dietitians-clinic -n 20 --no-pager
fi

# ===== Configure firewall =====
echo ""
echo ">>> Configuring firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
echo "✓ Firewall configured"

# ===== Done =====
echo ""
echo "============================================"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  Your site: https://$DOMAIN"
echo ""
echo "  Admin login: aarav@thedietitiansclinic.com"
echo "  Admin password: admin123"
echo ""
echo "  Client login: sneha@example.com"
echo "  Client password: client123"
echo ""
echo "  ⚠️  IMPORTANT: Change the admin password after first login!"
echo ""
echo "  🔄 AUTO-DEPLOY WEBHOOK SECRET:"
echo "  $WEBHOOK_SECRET"
echo "  (Use this as the secret when setting up GitHub webhook)"
echo ""
echo "  Useful commands:"
echo "  - Check app status:  systemctl status dietitians-clinic"
echo "  - Restart app:       systemctl restart dietitians-clinic"
echo "  - View logs:         journalctl -u dietitians-clinic -f"
echo "  - Check Caddy:       systemctl status caddy"
echo "============================================"
