#!/bin/bash
# ============================================================
# The Dietitian's Clinic — VPS Deployment Script
# For Hostinger KVM 1 (Ubuntu 22.04/24.04)
# ============================================================
# Run this on your VPS as root:
#   wget -O deploy.sh https://raw.githubusercontent.com/Khairey11/ashish-the-dietiations-clicnic/main/deploy.sh && bash deploy.sh
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
echo ">>> Step 1/7: Installing system dependencies..."
apt-get update -y
apt-get install -y curl git build-essential python3 ufw unzip
echo "✓ System packages installed"

# ===== Step 2: Install Node.js 20 LTS =====
echo ""
echo ">>> Step 2/7: Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "✓ Node.js $(node -v) installed"

# ===== Step 3: Install Bun =====
echo ""
echo ">>> Step 3/7: Installing Bun..."
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  # Add to bashrc for future sessions
  echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
  echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
fi
echo "✓ Bun installed"

# ===== Step 4: Install Caddy =====
echo ""
echo ">>> Step 4/7: Installing Caddy (web server with auto-HTTPS)..."
if ! command -v caddy &> /dev/null; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi
echo "✓ Caddy installed"

# ===== Step 5: Clone and build the project =====
echo ""
echo ">>> Step 5/7: Cloning and building the project..."
if [ -d "$APP_DIR" ]; then
  cd $APP_DIR
  git pull origin main
else
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Install dependencies
bun install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database
bun run scripts/seed.ts || true

# Generate session secret
SECRET=$(openssl rand -hex 32)

# Create .env
cat > .env << EOF
DATABASE_URL=file:$APP_DIR/db/custom.db
ADMIN_SESSION_SECRET=$SECRET
RESEND_API_KEY=
FROM_EMAIL=care@$DOMAIN
APP_BASE_URL=https://$DOMAIN
EOF

# Build the project
NEXT_TELEMETRY_DISABLED=1 bun run build

echo "✓ Project built successfully"

# ===== Step 6: Configure Caddy =====
echo ""
echo ">>> Step 6/7: Configuring Caddy with auto-HTTPS..."

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
systemctl restart caddy || caddy start --config /etc/caddy/Caddyfile
systemctl enable caddy 2>/dev/null || true
echo "✓ Caddy configured with auto-HTTPS for $DOMAIN"

# ===== Step 7: Create systemd service =====
echo ""
echo ">>> Step 7/7: Setting up systemd service..."

cat > /etc/systemd/system/dietitians-clinic.service << EOF
[Unit]
Description=The Dietitian's Clinic Next.js App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=$(which bun) run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable dietitians-clinic
systemctl restart dietitians-clinic
echo "✓ Systemd service created and started"

# ===== Configure firewall =====
echo ""
echo ">>> Configuring firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
echo "✓ Firewall configured (ports 80, 443, 22 open)"

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
echo "  Next steps:"
echo "  1. Point your domain DNS A record to this VPS IP"
echo "  2. Wait 5-15 minutes for DNS propagation"
echo "  3. Visit https://$DOMAIN"
echo ""
echo "  Useful commands:"
echo "  - Check app status:  systemctl status dietitians-clinic"
echo "  - Restart app:       systemctl restart dietitians-clinic"
echo "  - View logs:         journalctl -u dietitians-clinic -f"
echo "  - Check Caddy:       systemctl status caddy"
echo "============================================"
