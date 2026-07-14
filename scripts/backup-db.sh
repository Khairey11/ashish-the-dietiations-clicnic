#!/usr/bin/env bash
#
# SQLite backup script for The Dietitian's Clinic.
#
# Creates a timestamped backup of the SQLite database, keeps the last 30 days
# of backups locally, and (optionally) rsyncs to a remote destination.
#
# Usage:
#   ./scripts/backup-db.sh
#
# Cron (daily at 2:07 AM):
#   7 2 * * * cd /opt/dietitians-clinic && ./scripts/backup-db.sh >> /var/log/dietitians-backup.log 2>&1
#
# Required env (for remote copy):
#   BACKUP_REMOTE=user@backup-host:/path/to/backups/   — if unset, skips remote sync
#
# Exit codes:
#   0  success
#   1  misconfigured (DB path missing)
#   2  backup failed

set -euo pipefail

# --- config ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="${DATABASE_URL:-file:$PROJECT_DIR/db/custom.db}"
DB_FILE="${DB_PATH#file:}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/db/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
REMOTE="${BACKUP_REMOTE:-}"

# --- sanity ---
if [[ ! -f "$DB_FILE" ]]; then
  echo "❌ Database file not found: $DB_FILE"
  echo "   Set DATABASE_URL in .env, or check the path."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/custom-$TIMESTAMP.db"

echo "📦 Backing up $DB_FILE → $BACKUP_FILE"

# Use sqlite3's .backup command — safe even while the DB is being written to
# (uses SQLite's online backup API, takes a consistent snapshot).
if ! sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"; then
  echo "❌ sqlite3 backup failed. Is sqlite3 installed?"
  exit 2
fi

# Compress — SQLite files compress well (lots of empty pages).
if command -v gzip >/dev/null 2>&1; then
  gzip -f "$BACKUP_FILE"
  BACKUP_FILE="$BACKUP_FILE.gz"
  echo "   compressed → $BACKUP_FILE"
fi

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Backup complete: $BACKUP_FILE ($SIZE)"

# --- retention: delete local backups older than RETENTION_DAYS ---
find "$BACKUP_DIR" -name "custom-*.db*" -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true
echo "🧹 Pruned local backups older than $RETENTION_DAYS days."

# --- optional remote sync ---
if [[ -n "$REMOTE" ]]; then
  echo "📤 Syncing to remote: $REMOTE"
  if rsync -az --delete "$BACKUP_DIR/" "$REMOTE"; then
    echo "✅ Remote sync complete."
  else
    echo "⚠️  Remote sync failed (non-fatal — local backup is still good)."
  fi
else
  echo "ℹ️  BACKUP_REMOTE not set — skipping remote sync."
  echo "   Set BACKUP_REMOTE=user@host:/path/ to enable off-site backups."
fi

echo "Done at $(date)"
