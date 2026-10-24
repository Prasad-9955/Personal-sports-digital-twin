# PERSONAL SPORTS DIGITAL TWIN — PRODUCTION CLOUD DEPLOYMENT GUIDE

**Target Architecture**:
- **Backend & Database**: Render Cloud PaaS (Managed PostgreSQL + Dockerized FastAPI)
- **Frontend**: Vercel (Edge CDN, Automated SSL & SPA Routing)
- **Alternative**: Docker Compose (Local / Single-Server VPS)

---

## ARCHITECTURE OVERVIEW

```
  ┌────────────────────────────────────────────────────────┐
  │                 Vercel Global Edge CDN                 │
  │     https://your-sports-twin.vercel.app (React 19)     │
  └───────────────────────────┬────────────────────────────┘
                              │
              REST API Calls (HTTPS / Bearer JWT)
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │                   Render Cloud PaaS                    │
  │   https://sports-twin-backend.onrender.com (FastAPI)   │
  │   - OpenCV & MediaPipe BlazePose Video Engine          │
  │   - Nonparametric Baselines & OLS Kinematic Trends     │
  │   - Statistical Deviation & Twin State Synthesizer     │
  └───────────────────────────┬────────────────────────────┘
                              │
             Private Internal TCP Connection
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │               Render Managed PostgreSQL                │
  │            sports-twin-db (Persistent ACID)            │
  └────────────────────────────────────────────────────────┘
```

---

## PHASE 1: PUSH YOUR CODE TO GITHUB

Both Render and Vercel automatically deploy from your GitHub repository.

1. **Open a terminal in your project root** (`c:\Users\manda\Desktop\mini`).
2. **Commit all project files**:
   ```powershell
   git add .
   git commit -m "feat: complete Personal Sports Digital Twin with cloud deployment configurations"
   ```
3. **Create a new repository on GitHub**:
   - Go to [https://github.com/new](https://github.com/new).
   - Name your repository (e.g., `personal-sports-digital-twin`).
   - Set visibility to **Public** or **Private**.
   - Do **NOT** initialize with a README, .gitignore, or license (we already created them).
   - Click **Create repository**.
4. **Push your code to GitHub**:
   ```powershell
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/personal-sports-digital-twin.git
   git branch -M main
   git push -u origin main
   ```

---

## PHASE 2: DEPLOY DATABASE & BACKEND ON RENDER

Render offers free managed PostgreSQL databases and free Web Services. We have included a **Render Blueprint** (`render.yaml`) for 1-click provisioning.

### Method A: One-Click Blueprint Deployment (Recommended)

1. Sign up or log in to **[Render.com](https://render.com/)**.
2. From the dashboard, click the **New +** button in the top navigation bar.
3. Select **Blueprint**.
4. Connect your GitHub account and select your repository: `personal-sports-digital-twin`.
5. Render will automatically read `render.yaml` and show:
   - **Database**: `sports-twin-db` (PostgreSQL)
   - **Web Service**: `sports-twin-backend` (Dockerized FastAPI)
6. Click **Apply**.
7. Render will provision the database and build the Docker container. This takes approximately 3–5 minutes on first build because it compiles the OpenCV and MediaPipe Linux libraries.
8. Once the build finishes, you will see a green **"Live"** badge and your public backend URL:
   ```
   https://sports-twin-backend-xxxx.onrender.com
   ```
   *(Save this URL for Phase 3!)*

### Method B: Manual Render Deployment (Alternative)

If you prefer to configure services manually without blueprints:

1. **Create PostgreSQL Database**:
   - In Render, click **New +** $\to$ **PostgreSQL**.
   - Name: `sports-twin-db`
   - Database Name: `sports_twin`
   - User: `postgres`
   - Plan: **Free**
   - Click **Create Database**.
   - Copy the **Internal Database URL** (e.g., `postgres://postgres:...@.../sports_twin`).

2. **Create FastAPI Web Service**:
   - Click **New +** $\to$ **Web Service**.
   - Select your GitHub repository.
   - Name: `sports-twin-backend`
   - Root Directory: `backend`
   - Runtime: **Docker** (Render will use `backend/Dockerfile`)
   - Plan: **Free**
   - Add Environment Variables:
     | Key | Value |
     | :--- | :--- |
     | `DATABASE_URL` | *(Paste Internal Database URL from step 1)* |
     | `JWT_SECRET` | *(Generate a random 32+ character string)* |
     | `JWT_ALGORITHM` | `HS256` |
     | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
     | `ENVIRONMENT` | `production` |
     | `GEMINI_MODEL` | `gemini-2.5-flash` |
     | `GEMINI_API_KEY` | *(Your Gemini API key, or leave blank for deterministic fallback)* |
   - Click **Create Web Service**.

3. **Verify Backend Health**:
   - Once deployed, visit: `https://sports-twin-backend-xxxx.onrender.com/health`
   - Expected response:
     ```json
     {
       "status": "HEALTHY",
       "database_connected": true,
       "environment": "production",
       "gemini_api_configured": true
     }
     ```
   - Interactive Swagger API docs are available at `https://sports-twin-backend-xxxx.onrender.com/docs`.

---

## PHASE 3: DEPLOY FRONTEND ON VERCEL

Vercel provides instant global deployment and automated SSL certificates for React applications.

1. Sign up or log in to **[Vercel.com](https://vercel.com/)** using your GitHub account.
2. In the Vercel dashboard, click **Add New...** $\to$ **Project**.
3. Import your GitHub repository: `personal-sports-digital-twin`.
4. Configure the project settings:
   - **Project Name**: `personal-sports-digital-twin` (or any custom name)
   - **Framework Preset**: `Vite` (Vercel automatically detects Vite)
   - **Root Directory**: Click **Edit** and choose `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Add Environment Variable**:
   - Expand the **Environment Variables** accordion.
   - Add the following variable:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://sports-twin-backend-xxxx.onrender.com` *(Use your exact Render backend URL from Phase 2, with NO trailing slash)*
6. Click **Deploy**.
7. Vercel will build and deploy the React application in about 45 seconds.
8. Click **Visit** or open your new live production URL:
   ```
   https://personal-sports-digital-twin-xxxx.vercel.app
   ```

---

## PHASE 4: VERIFY END-TO-END PRODUCTION SYSTEM

1. **Access Web Application**:
   - Open your Vercel URL in your browser.
2. **Register a New Athlete**:
   - Click **Sign Up**.
   - Register an athlete profile (Name: *"Championship Sprinter"*, Sport: *"Track & Field"*).
3. **Verify Baseline Calibration State**:
   - Navigate to the **Digital Twin** view.
   - Confirm baseline message: *"No sessions recorded yet. Upload your first movement video to initiate your Digital Twin."*
4. **Seed Demonstration Data or Upload Real Video**:
   - Click **Upload Video** to upload an athletic movement MP4/MOV clip, or trigger the `/api/v1/demo/seed` endpoint via Swagger docs to populate 5 longitudinal sessions.
5. **Inspect Live Twin Progression**:
   - Confirm state machine version increment ($v_1 \to v_2 \dots$).
   - Check the **Bilateral Knee Symmetry Radar**.
   - Check **Kinematic Regression Trends** and **AI Biomechanical Drill Prescriptions**.

---

## ALTERNATIVE: SINGLE-COMMAND LOCAL / VPS DOCKER DEPLOYMENT

If you want to run the full stack (PostgreSQL + FastAPI + React/Nginx) in Docker containers locally or on a cloud VM (AWS EC2, DigitalOcean Droplet, Linode):

1. **Run Docker Compose**:
   ```powershell
   docker compose up --build -d
   ```
2. **Access Services**:
   - Web Application: [http://localhost:3000](http://localhost:3000)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - PostgreSQL Database: `localhost:5432` (`sports_twin`)
3. **Stop Services**:
   ```powershell
   docker compose down
   ```

---

## PRODUCTION ENVIRONMENT VARIABLES REFERENCE

| Variable | Target Service | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend | PostgreSQL connection string | `postgresql://user:pass@host:5432/sports_twin` |
| `JWT_SECRET` | Backend | Cryptographic secret for signing tokens | `super_secret_production_key_32_chars` |
| `JWT_ALGORITHM` | Backend | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | Token validity window | `1440` (24 hours) |
| `ENVIRONMENT` | Backend | Operational environment mode | `production` |
| `GEMINI_MODEL` | Backend | Target Gemini AI model | `gemini-2.5-flash` |
| `GEMINI_API_KEY` | Backend | Google GenAI API key | `AIzaSy...` (optional, fallback activates if omitted) |
| `VITE_API_BASE_URL` | Frontend | Target backend API root | `https://sports-twin-backend.onrender.com` |
