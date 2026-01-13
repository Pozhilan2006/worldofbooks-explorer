# Render Deployment Guide

## Environment Variables Configuration

### Web Service (Backend)

```env
# Required
NODE_ENV=production
DATABASE_URL=<internal_postgres_url>
PORT=3000

# Scraping (with Redis)
SCRAPE_QUEUE_ENABLED=true
REDIS_URL_INTERNAL=<internal_redis_url>

# CORS
CORS_ORIGIN=https://your-frontend.onrender.com
```

### Worker Service

```env
# Required
NODE_ENV=production
DATABASE_URL=<internal_postgres_url>

# Scraping
SCRAPE_QUEUE_ENABLED=true
REDIS_URL_INTERNAL=<internal_redis_url>
```

---

## Render Services Setup

### 1. PostgreSQL Database

1. Create new PostgreSQL instance
2. Copy **Internal Database URL**
3. Use in both Web Service and Worker

### 2. Redis Instance

1. Create new Redis instance
2. Copy **Internal Redis URL** (e.g., `redis://red-xxx:6379`)
3. Use in both Web Service and Worker

### 3. Web Service (Backend API)

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npx prisma migrate deploy && node dist/main.js
```

**Environment Variables:**
- `NODE_ENV=production`
- `DATABASE_URL=<internal_postgres_url>`
- `SCRAPE_QUEUE_ENABLED=true`
- `REDIS_URL_INTERNAL=<internal_redis_url>`
- `CORS_ORIGIN=<your_frontend_url>`

### 4. Background Worker

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
node --max-old-space-size=4096 dist/workers/scrape.worker.js
```

**Environment Variables:**
- `NODE_ENV=production`
- `DATABASE_URL=<internal_postgres_url>`
- `SCRAPE_QUEUE_ENABLED=true`
- `REDIS_URL_INTERNAL=<internal_redis_url>`

---

## Deployment Flow

### First Deploy

1. **Web Service starts:**
   - Runs migrations
   - Connects to Redis
   - Checks Navigation table
   - If empty → enqueues navigation scrape
   - API ready at `/api`

2. **Worker starts:**
   - Connects to Redis
   - Listens for jobs
   - Processes navigation scrape
   - Cascades to categories → products

### Subsequent Deploys

- Navigation table has data
- No auto-scrape triggered
- Worker processes any queued jobs

---

## Local Development (No Redis)

```env
# .env
NODE_ENV=development
DATABASE_URL=postgresql://...
SCRAPE_QUEUE_ENABLED=false
```

**Start backend:**
```bash
npm run start:dev
```

**Expected logs:**
```
[SCRAPE MODULE] Queue disabled (SCRAPE_QUEUE_ENABLED != true)
[SCRAPE STARTUP] Queue disabled - skipping auto-scrape check
🚀 Application is running on: http://localhost:3000/api
```

---

## Troubleshooting

### Build Fails: "nest: command not found"

✅ **Fixed** - Using `npx nest build` instead of `nest build`

### Worker Crashes: "Out of Memory"

✅ **Fixed** - Using `--max-old-space-size=4096` flag

### Backend Starts But No Scraping

**Check:**
1. `SCRAPE_QUEUE_ENABLED=true` ✓
2. `REDIS_URL_INTERNAL` is set ✓
3. Worker is running ✓
4. Navigation table is empty ✓

**Logs to verify:**
```
[SCRAPE MODULE] Queue enabled - initializing BullMQ
[SCRAPE QUEUE] Connected to Redis
[SCRAPE STARTUP] Navigation table empty - triggering initial scrape
[SCRAPE STARTUP] Initial navigation scrape enqueued
```

### Local Dev Requires Redis

**Solution:** Set `SCRAPE_QUEUE_ENABLED=false` in `.env`

---

## Verification Checklist

- [ ] Build succeeds with `npm run build`
- [ ] Web Service starts without errors
- [ ] Worker starts without errors
- [ ] Navigation table auto-populates
- [ ] Categories cascade from navigation
- [ ] Products cascade from categories
- [ ] API endpoints return data
- [ ] Frontend can fetch products

---

## Manual Scrape Trigger (If Needed)

If auto-scrape doesn't work, trigger manually:

```bash
# Via API
curl -X POST https://your-backend.onrender.com/api/scrape/navigation
```

---

## Monitoring

### Check Queue Status

```bash
curl https://your-backend.onrender.com/api/health
```

### View Logs

- Render Dashboard → Web Service → Logs
- Render Dashboard → Worker → Logs

### Database Check

```sql
-- Check if data is being scraped
SELECT COUNT(*) FROM navigation;
SELECT COUNT(*) FROM category;
SELECT COUNT(*) FROM product;
```
