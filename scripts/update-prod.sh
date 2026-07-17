#!/usr/bin/env bash
#
# Quick update script for The Dietitian's Clinic production server.
# Run this on the VPS after pushing new code to GitHub.
#
# Usage:
#   ssh root@your-server
#   cd /opt/dietitians-clinic
#   bash scripts/update-prod.sh
#
# What it does:
#   1. Pulls the latest code from GitHub
#   2. Installs dependencies
#   3. Generates Prisma client + pushes schema
#   4. Builds the Next.js app
#   5. Copies static files to standalone
#   6. Restarts the systemd service
#
# Total time: ~2-3 minutes.

set -e

echo "🔄 Updating The Dietitian's Clinic..."
echo ""

# Step 1: Pull latest code
echo ">>> 1/6: Pulling latest code..."
git stash 2>/dev/null || true
git pull origin main
echo "✓ Code updated"
echo ""

# Step 2: Install dependencies
echo ">>> 2/6: Installing dependencies..."
bun install --frozen-lockfile
echo "✓ Dependencies installed"
echo ""

# Step 3: Generate Prisma client + push schema
echo ">>> 3/6: Updating database schema..."
npx prisma generate
npx prisma db push
echo "✓ Database schema updated"
echo ""

# Step 4: Build the app
echo ">>> 4/6: Building Next.js app (this takes ~2 minutes)..."
NEXT_TELEMETRY_DISABLED=1 bun run build
echo "✓ Build complete"
echo ""

# Step 5: Copy static files to standalone
echo ">>> 5/6: Copying static files..."
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
echo "✓ Static files copied"
echo ""

# Step 6: Restart the service
echo ">>> 6/6: Restarting service..."
systemctl restart dietitians-clinic
sleep 3

if systemctl is-active --quiet dietitians-clinic; then
  echo "✓ Service restarted successfully"
else
  echo "⚠️  Service failed to start. Check logs:"
  echo "   journalctl -u dietitians-clinic -n 20 --no-pager"
  exit 1
fi

echo ""
echo "============================================"
echo "  ✅ UPDATE COMPLETE!"
echo "============================================"
echo ""
echo "  Your site: https://thedietitiansclinic.com"
echo ""
echo "  Useful commands:"
echo "  - Check status:  systemctl status dietitians-clinic"
echo "  - View logs:     journalctl -u dietitians-clinic -f"
echo "============================================"
