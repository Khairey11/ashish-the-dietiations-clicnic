# PostgreSQL Migration Guide

## Current State
The application uses SQLite (`prisma/db/dev.db`) via Prisma. This is acceptable for 
development and small-scale production (single VPS, <100 concurrent users).

## When to Migrate
Migrate to PostgreSQL when any of the following become true:
- **Concurrent write conflicts**: SQLite locks the entire database on writes. If you 
  see `SQLITE_BUSY` errors, it's time.
- **Multi-instance deployment**: If you scale to 2+ app servers, they can't share a 
  single SQLite file.
- **Database size > 1GB**: SQLite performance degrades with large datasets.
- **Need for read replicas**: PostgreSQL supports streaming replication.

## Migration Steps

### 1. Provision PostgreSQL
```bash
# On the VPS (or use a managed service like Supabase/Neon)
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser --createdb dietitians
sudo -u postgres createdb -O dietitians dietitians_clinic
sudo -u postgres psql -c "ALTER USER dietitians PASSWORD 'your-strong-password';"
```

### 2. Update `.env`
```env
# Change from:
DATABASE_URL="file:/opt/dietitians-clinic/prisma/db/dev.db"
# To:
DATABASE_URL="postgresql://dietitians:your-password@localhost:5432/dietitians_clinic?schema=public"
```

### 3. Update Prisma Schema
In `prisma/schema.prisma`, line 3:
```prisma
// Change from:
datasource db {
  provider = "sqlite"
  url = env("DATABASE_URL")
}
// To:
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}
```

### 4. Migrate Data (if production data exists)
```bash
# Install prisma-db-seeder to export SQLite data
npx prisma db pull   # Regenerate schema from current SQLite

# Export data from SQLite
sqlite3 prisma/db/dev.db .dump > data.sql

# Push schema to PostgreSQL
npx prisma db push

# Import data (adjust SQL syntax for PostgreSQL)
psql -U dietitians -d dietitians_clinic -f data.sql
```

### 5. Regenerate Client & Test
```bash
npx prisma generate
npx prisma db push
bun run build
```

### 6. Verify
- Run the seed script: `bun run scripts/seed.ts`
- Test all API endpoints
- Monitor for connection errors

## Benefits of PostgreSQL
- ACID-compliant with MVCC (no read locks)
- Full-text search built-in
- JSON column support
- Row-level security
- Point-in-time recovery with WAL archiving
- Connection pooling (PgBouncer)