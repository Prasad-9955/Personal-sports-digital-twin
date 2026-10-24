# PERSONAL SPORTS DIGITAL TWIN — ZERO-BUDGET (₹0) PRODUCTION DEPLOYMENT GUIDE

**Project**: Personal Sports Digital Twin for Longitudinal Biomechanical and Performance Trend Analysis  
**Repository**: [https://github.com/Prasad-9955/Personal-sports-digital-twin](https://github.com/Prasad-9955/Personal-sports-digital-twin)  
**Target Duration**: 2+ Months Accessibility  
**Budget Constraint**: Exactly ₹0 (Zero Credit Card, Debit Card, or Billing Account Required)

---

## 1. SELECTED PRODUCTION ARCHITECTURE & RATIONALE

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Cloudflare Pages (Global CDN)                     │
│               https://sports-twin.pages.dev (React 19)                 │
│               - 100% Free Forever, Zero Payment Card Required          │
│               - 24/7 Global Uptime, Automated SSL Encryption           │
│               - Single Page Application (SPA) Client Routing           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  HTTPS API Requests (Bearer JWT Auth)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Cloudflare Secure HTTP/2 Tunnel                     │
│           https://<your-tunnel-subdomain>.trycloudflare.com            │
│           - Connects Public Internet to Local Backend Over TCP 443     │
│           - Bypasses Carrier NAT & Mobile UDP Blocks (Jio / Airtel)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  User-Owned Host Machine (Windows 11)                  │
│                                                                        │
│  FastAPI Backend (Port 8000)        PostgreSQL Database (Port 5432)   │
│  - OpenCV Video Processing          - 44 Persistent Completed Sessions │
│  - MediaPipe BlazePose (33 LMs)     - 20 Sequential Twin States (v20)  │
│  - Nonparametric Baselines (IQR)    - Personal Baselines & Anomaly MAD │
│  - OLS Trajectory Linear Regress.   - 100% Data Preservation, Zero RAM │
│  - Resilient Gemini AI Fallback       or Processing Quota Restrictions │
└────────────────────────────────────────────────────────────────────────┘
```

### Why This Architecture Was Selected:
1. **Zero Financial or Card Requirement**: Cloudflare Pages requires **no credit card, no debit card, and no billing verification**.
2. **Heavy Computer Vision Compatibility**: MediaPipe BlazePose and OpenCV require substantial RAM and CPU for per-frame 3D landmark extraction. Free cloud hosts (e.g. 512MB RAM limits) routinely trigger Out-Of-Memory (OOM) crashes during video processing. Your local host provides unconstrained CPU and memory.
3. **Data Preservation**: All 44 existing completed sessions and `v20` twin state records remain completely safe in PostgreSQL without risk of cloud trial expiration or ephemeral disk wipes.
4. **Mobile Usability**: Cloudflare edge routing with HTTP/2 ensures seamless access on Android smartphones, iPhones, tablets, laptops, and desktops.

---

## 2. PROVIDER SIGNUP & REGISTRATION

### Cloudflare Pages (Frontend Hosting — Free Forever)
- **Signup Link**: [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
- **Verification**: Standard email signup or 1-click Google OAuth. **No credit or debit card is ever requested.**

---

## 3. EXACT CLOUDFLARE PAGES DASHBOARD SETTINGS

1. Log in to your **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. In the left navigation menu, navigate to **Workers & Pages**.
3. Click the **Create application** button $\to$ select the **Pages** tab.
4. Click **Connect to Git** and authorize your GitHub account (`Prasad-9955`).
5. Select your repository: **`Prasad-9955/Personal-sports-digital-twin`** $\to$ click **Begin setup**.
6. Enter the exact configuration settings below:

| Field | Configuration Value | Notes |
| :--- | :--- | :--- |
| **Project name** | `personal-sports-digital-twin` | Customizes your URL: `personal-sports-digital-twin.pages.dev` |
| **Production branch** | `main` | Deploys automatically on git pushes |
| **Framework preset** | `Vite` | Configures standard Vite toolchain |
| **Root directory** | `web` | **Crucial**: Points to the React frontend folder |
| **Build command** | `npm run build` | Runs TypeScript compilation & Vite bundle |
| **Build output directory** | `dist` | Target directory containing HTML/JS assets |

7. **Environment Variables**:
   - Click **Add variable**:
     - **Variable name**: `VITE_API_BASE_URL`
     - **Value**: `https://<your-active-tunnel>.trycloudflare.com` *(Your active Cloudflare Tunnel backend URL, with no trailing slash)*
8. Click **Save and Deploy**.
   *(Deployment takes approximately 45–60 seconds).*

---

## 4. LOCAL BACKEND & DATABASE STARTUP COMMANDS

To make your backend available to your public Cloudflare Pages website, execute these two commands on your computer:

### Step 1: Start PostgreSQL & FastAPI Backend
Open a terminal (PowerShell or Command Prompt) in `c:\Users\manda\Desktop\mini`:
```powershell
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```
*Verify output: `INFO: Uvicorn running on http://0.0.0.0:8000`.*

### Step 2: Start Cloudflare Tunnel
Open a second terminal in `c:\Users\manda\Desktop\mini`:
```powershell
# For exposing the full unified web application + backend proxy on port 5173:
.\cloudflared.exe tunnel --edge-ip-version 4 --protocol http2 --url http://localhost:5173

# Or for exposing backend API alone on port 8000 (when using Cloudflare Pages frontend):
.\cloudflared.exe tunnel --edge-ip-version 4 --protocol http2 --url http://localhost:8000
```
*Note: `--edge-ip-version 4 --protocol http2` ensures compatibility with Indian mobile operators (Jio / Airtel) by avoiding cellular UDP/IPv6 drops.*
*Look for the output line: `https://<random-subdomain>.trycloudflare.com`.*

---

## 5. REQUIRED ENVIRONMENT VARIABLES REFERENCE

Create a local `backend/.env` file with these values (all sensitive tokens are stored locally, never exposed to git):

```bash
# Database Configuration (Local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sports_twin

# Security / Authentication
JWT_SECRET=personal_sports_digital_twin_academic_production_secret_2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# File Upload Guardrails
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=100
ALLOWED_EXTENSIONS=mp4,mov,avi

# Gemini AI (Optional - Factual deterministic fallback is active if omitted)
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=

# Server Configuration
ENVIRONMENT=production
LOG_LEVEL=INFO
```

---

## 6. DEPLOYING FRONTEND UPDATES FROM GITHUB

Whenever you modify code or components in `web/`:
1. Commit and push your changes:
   ```powershell
   git add web/
   git commit -m "feat: enhance mobile responsive layout"
   git push origin main
   ```
2. Cloudflare Pages automatically detects the push, rebuilds the frontend in ~45 seconds, and updates your live URL with zero downtime.

---

## 7. HOW TO RESTART BACKEND & TUNNEL

If your computer restarts or enters sleep mode:
1. Ensure the PostgreSQL service is running (`net start postgresql-x64-16` or open Services).
2. Start the FastAPI backend:
   ```powershell
   python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
   ```
3. Start the tunnel:
   ```powershell
   .\cloudflared.exe tunnel --edge-ip-version 4 --protocol http2 --url http://localhost:5173
   ```
4. If the tunnel generates a new URL, update `VITE_API_BASE_URL` in Cloudflare Pages dashboard under **Settings** $\to$ **Environment Variables** $\to$ **Retry deployment**.

---

## 8. MOBILE TESTING INSTRUCTIONS (ANDROID & IPHONE)

1. Open Chrome (Android) or Safari (iPhone).
2. Enter your Cloudflare Pages URL: `https://personal-sports-digital-twin.pages.dev`.
3. **Verify Layout & Touch Target Responsiveness**:
   - Sticky top bar shows active health pulse badge.
   - Hamburger drawer opens smoothly with large touch targets.
   - Tap **Sign In** and enter demo credentials:
     - **Email**: `demo_user@example.com`
     - **Password**: `Password123!`
4. **Test Video Capture**:
   - Navigate to **Analyze Video**.
   - Tap the upload dropzone $\to$ mobile camera prompts: *"Take Video"* or *"Photo Library"*.
   - Record or select a 3–10 second video clip of running gait $\to$ observe upload progress and BlazePose pipeline steps.
5. **Inspect Live Twin Progression**:
   - View updated **State Version**, **Bilateral Radar Plot**, and **Kinematic Trends** reflowing seamlessly without horizontal overflow.

---

## 9. DATABASE BACKUP & DISASTER RECOVERY

To ensure your 44 sessions, baselines, and twin states are permanently preserved:

### Backup Command (Export SQL Dump):
```powershell
pg_dump -U postgres -d sports_twin -F c -b -v -f "c:\Users\manda\Desktop\mini\sports_twin_backup_$(Get-Date -Format 'yyyyMMdd').dump"
```

### Restore Command (Import SQL Dump):
```powershell
pg_restore -U postgres -d sports_twin -v "c:\Users\manda\Desktop\mini\sports_twin_backup_20261024.dump"
```

---

## 10. FREE-TIER RESTRICTIONS & AVAILABILITY LIMITATIONS

| Limitation | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Host Computer Dependency** | If laptop sleeps or Wi-Fi drops, backend API calls fail. | Set Windows power plan to *"Never sleep when plugged in"* during presentation or evaluation days. |
| **Temporary Subdomain Fluctuation** | Free `trycloudflare.com` quick tunnels generate a new subdomain upon process restart. | Update `VITE_API_BASE_URL` in Cloudflare Pages, or register a free domain via Cloudflare Zero Trust (also 100% free). |
| **Cloudflare Pages Build Limits** | 500 builds per month on free tier. | Only push tested commits to `main`; preview builds locally before pushing. |
| **Local Upload Disk Space** | Uploaded video files accumulate in `backend/uploads/`. | Periodically delete processed raw video clips older than 30 days while preserving extracted metric rows in PostgreSQL. |

---

## 11. TROUBLESHOOTING GUIDE

### 1. CORS Preflight Failures (`Cross-Origin Request Blocked`)
- **Cause**: Backend rejects origin.
- **Fix**: Verified `app.add_middleware(CORSMiddleware, allow_origin_regex=r"https?://.*", allow_credentials=True)` is present in `backend/app/main.py`.

### 2. Database Connection Denied (`Port 5432 failed: 10013`)
- **Cause**: Windows sandbox TCP restriction or PostgreSQL service stopped.
- **Fix**: Run backend commands outside sandbox (`BypassSandbox: true`), or run `net start postgresql-x64-16` in Administrator command prompt.

### 3. Mobile Network Error on Cellular Data (Jio / Airtel)
- **Cause**: Carrier network firewalls drop UDP packets on non-standard ports.
- **Fix**: Launch tunnel strictly with `--protocol http2`. This forces outbound communication over TCP port 443 (standard HTTPS).

### 4. Video Processing Failures (`Insufficient landmark quality`)
- **Cause**: Lighting too dim, camera shaking excessively, or runner partially cropped.
- **Fix**: Follow in-app guidelines (sagittal lateral angle, 3–15 seconds, full body visible from head to toe).

---

## 12. STRATEGY FOR KEEPING THE PROJECT ACCESSIBLE FOR 2+ MONTHS

To ensure uninterrupted demonstration capability throughout the next 60+ days without paying any fees:
1. **Frontend Always Live**: Cloudflare Pages serves the static React application 24/7/365 without sleep cycles or monthly expiration.
2. **Scheduled Demonstration Mode**:
   - When presenting to evaluators, guides, or interviewers, boot the laptop, start Uvicorn and Cloudflare Tunnel, and ensure the active tunnel URL is configured in Cloudflare Pages.
   - For offline evaluation, reviewers can inspect the full architecture, code, test suites, and documentation directly on GitHub.
3. **Weekly Health Check**: Run `curl -s https://<tunnel-url>/health` once a week to confirm PostgreSQL and FastAPI connectivity.
