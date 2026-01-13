# Worker Startup Guide

## ⚠️ IMPORTANT: Memory Management

The scraper worker uses Playwright (Chromium) which requires significant memory. Follow these steps to prevent crashes.

---

## 🚀 Production Startup (Recommended)

### Step 1: Build the Application
```bash
cd backend
npm run build
```

### Step 2: Start Backend (Terminal 1)
```bash
node dist/main.js
```

**Expected output:**
```
🚀 Application is running on: http://localhost:3000/api
📝 Environment: production
```

### Step 3: Start Worker (Terminal 2)
```bash
npm run worker
```

**Or manually with memory limit:**
```bash
node --max-old-space-size=4096 dist/workers/scrape.worker.js
```

**Expected output:**
```
[SCRAPE WORKER] Starting worker...
[SCRAPE WORKER] Worker initialized and listening for jobs
```

---

## 🔧 Development Startup

### Option A: Backend Only (No Worker)
```bash
npm run start:dev
```

This runs the API without the scraper worker. Use this for:
- Testing API endpoints
- Frontend development
- Database operations

### Option B: Worker Only (Standalone)
```bash
# Build first
npm run build

# Run worker
npm run worker
```

---

## ⚙️ Configuration

### Worker Concurrency Settings

**BullMQ Worker** (`src/workers/scrape.worker.ts`):
```typescript
concurrency: 1  // Process 1 job at a time
```

**Crawlee Scraper** (`src/workers/scraper/scraper.config.ts`):
```typescript
maxConcurrency: 2  // Max 2 concurrent browser pages
```

**Why these settings?**
- BullMQ concurrency: 1 → Prevents multiple Playwright instances
- Crawlee concurrency: 2 → Allows efficient scraping without memory spike
- Combined: Safe memory usage

---

## 🐛 Troubleshooting

### Worker Crashes with "Out of Memory"

**Solution 1: Increase Node memory**
```bash
node --max-old-space-size=8192 dist/workers/scrape.worker.js
```

**Solution 2: Reduce Crawlee concurrency**
Edit `src/workers/scraper/scraper.config.ts`:
```typescript
maxConcurrency: 1  // Reduce from 2 to 1
```

### Worker Not Processing Jobs

**Check Redis connection:**
```bash
# Verify REDIS_URL_INTERNAL is set
echo $REDIS_URL_INTERNAL
```

**Check queue:**
```bash
# View queue stats
curl http://localhost:3000/api/queue/stats
```

### Backend Crashes on Startup

**Cause:** Worker is being imported into Nest modules

**Solution:** Verify no imports like:
```typescript
// ❌ NEVER do this
import './workers/scrape.worker';
import { Worker } from 'bullmq';  // in Nest modules
```

---

## 📊 Monitoring

### Check Worker Status
```bash
# Backend health
curl http://localhost:3000/api/health

# Queue statistics
curl http://localhost:3000/api/queue/stats
```

### View Logs
```bash
# Worker logs
tail -f worker.log

# Backend logs
tail -f backend.log
```

---

## 🎯 Best Practices

1. **Always build before running in production**
   ```bash
   npm run build
   ```

2. **Run backend and worker in separate terminals**
   - Terminal 1: Backend API
   - Terminal 2: Worker

3. **Never use `--watch` mode with worker**
   - Watch mode reloads code
   - Playwright doesn't release memory
   - Causes crashes

4. **Monitor memory usage**
   ```bash
   # Windows
   tasklist | findstr node
   
   # Linux/Mac
   ps aux | grep node
   ```

5. **Set memory limits in production**
   ```bash
   node --max-old-space-size=4096 dist/workers/scrape.worker.js
   ```

---

## 📝 Summary

**Correct Setup:**
```
✅ Backend: node dist/main.js
✅ Worker:  node --max-old-space-size=4096 dist/workers/scrape.worker.js
✅ Separate terminals
✅ No watch mode
✅ Memory limit set
```

**Incorrect Setup:**
```
❌ npm run start:dev (with worker imported)
❌ Worker in same process as backend
❌ No memory limit
❌ Concurrency too high
```

---

## 🚦 Verification Checklist

- [ ] Backend runs without worker
- [ ] Worker runs in separate terminal
- [ ] No memory crash for 5+ minutes
- [ ] Jobs are processed successfully
- [ ] Memory usage stays under 4GB
