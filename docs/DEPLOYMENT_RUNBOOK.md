# PERSONAL SPORTS DIGITAL TWIN — DEPLOYMENT RUNBOOK & 2-MONTH RELIABILITY PLAN

**Document ID**: `docs/DEPLOYMENT_RUNBOOK.md`  
**Production Architecture**: Vercel (Frontend) + Render (FastAPI Backend + PostgreSQL)  
**Budget**: ₹0.00 strictly  
**Operational Target**: 60+ Days Uninterrupted Operation  
**Last Updated**: October 29, 2026

---

## 1. Hosting Architecture & Service Mapping

```
                         [ Global Client Devices ]
                    (Android / iPhone / Mac / Windows)
                                    │
                                    ▼ (HTTPS)
      ┌─────────────────────────────────────────────────────────┐
      │                   FRONTEND (Vercel)                     │
      │        https://personal-sports-digital-twin.vercel.app  │
      │  - React 19 + TypeScript + Vite + Tailwind v4           │
      │  - Edge CDN with automatic SPA rewrite routing          │
      │  - 100% Free Forever (100GB bandwidth/month)           │
      └────────────────────────────┬────────────────────────────┘
                                   │ HTTPS REST Calls
                                   ▼
      ┌─────────────────────────────────────────────────────────┐
      │                   BACKEND (Render)                      │
      │     https://personal-sports-digital-twin.onrender.com   │
      │  - FastAPI + Python 3.11 + Uvicorn                      │
      │  - MediaPipe BlazePose Lite (Lazy-loaded)               │
      │  - OpenCV Computer Vision Ingestion                     │
      │  - 750 free instance hours / month                      │
      └────────────────────────────┬────────────────────────────┘
                                   │ Internal Private Network (dpg-...)
                                   ▼
      ┌─────────────────────────────────────────────────────────┐
      │                   DATABASE (Render)                     │
      │                     sports-twin-db                      │
      │  - Managed PostgreSQL 16 (1GB Storage, Free Tier)       │
      │  - Stores Athletes, Sessions, Twins, Baselines, Trends   │
      └─────────────────────────────────────────────────────────┘
```

---

## 2. Free-Tier Operational Constraints & Behaviors

### 1. Inactivity Spin-Down (Cold Start)
- **Behavior**: Render's free tier spins down the backend container after **15 minutes** of no incoming requests.
- **Impact**: The first request after a period of inactivity takes **30–50 seconds** while Render spins up the container.
- **Handling**: The React frontend features built-in retry logic and clear loading indicators. Subsequent requests respond in **<150ms**.

### 2. Render PostgreSQL 30-Day Lifecycle Strategy (2-Month Plan)
- **Constraint**: Render's free PostgreSQL tier remains active for 30 days before requiring rotation.
- **Two-Month Solution (₹0 Spend)**:
  - **Option A (In-Place Backup & Restore)**: On Day 28, run a quick backup and create a new free Postgres database in Render (takes 2 minutes).
  - **Option B (Permanent Serverless DB via Neon.tech)**: If you wish to eliminate the 30-day rotation, sign up at [Neon.tech](https://neon.tech) using GitHub (100% free, no credit card required, never expires), and paste its connection string into `DATABASE_URL` in your Render Environment settings.

---

## 3. Operations & Maintenance Procedures

### How to Check System Health
Run this probe from any browser or terminal:
```bash
curl -i https://personal-sports-digital-twin.onrender.com/health
```
Expected response:
```json
{"status":"HEALTHY","database_connected":true,"environment":"production","gemini_api_configured":false}
```

### How to Deploy Code Updates
1. Push your changes to GitHub `main`:
   ```bash
   git add .
   git commit -m "feat: your new feature"
   git push origin main
   ```
2. **Vercel** automatically rebuilds the frontend in ~35 seconds.
3. **Render** automatically rebuilds the backend in ~2 minutes.

### Database Backup Procedure
To export a snapshot of your production data at any time:
```bash
pg_dump "postgres://sports_twin_user:<PASSWORD>@<EXTERNAL_HOST>/sports_twin" -F c -b -v -f sports_twin_prod_backup.dump
```

---

## 4. Mobile Testing & Troubleshooting Checklist

| Test Item | Verification Procedure | Expected Outcome |
| :--- | :--- | :--- |
| **Android Chrome** | Open `https://personal-sports-digital-twin.vercel.app` | Instant load, touch targets $\ge 48\text{px}$, zero horizontal overflow |
| **iPhone Safari** | Open `https://personal-sports-digital-twin.vercel.app` | Viewport adapts to notch/home indicator cleanly |
| **User Sign In** | Use registered demo credentials | JWT issued, redirects to dashboard smoothly |
| **Video Upload** | Tap dropzone on mobile device | Native camera selector ("Take Video" / "Photo Library") opens |
| **Cold Start** | Open app after 20 minutes idle | Spinner displays; wakes in ~35s without throwing unhandled error |
