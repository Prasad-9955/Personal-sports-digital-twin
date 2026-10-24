# Personal Sports Digital Twin — Web Application 🏃‍♂️💻

The web frontend client for the **Personal Sports Digital Twin** platform, built with **React 18 + TypeScript + Vite + Tailwind CSS**.

Provides athletes, coaches, and researchers with full access to longitudinal biomechanical telemetry, video-based pose estimation, personal baseline distributions, and Google Gemini AI coaching through desktop, laptop, tablet, and mobile browsers.

---

## 🛠️ Technology Stack

- **Framework**: React 18 / 19 with TypeScript 5
- **Build Tool**: Vite 8 with `@tailwindcss/vite`
- **Routing**: `react-router-dom` v6 with protected route guards
- **Styling**: Tailwind CSS v4 with an athletic dark telemetry design system
- **Charts**: `recharts` (composable SVG spline curves, baseline reference bands, anomaly flag dots)
- **HTTP Client**: `axios` with automatic JWT Bearer token interceptor and error handling
- **Icons**: `lucide-react`
- **Date Utilities**: `date-fns`

---

## 📁 Project Architecture

```
web/
├── public/                  # Static assets and favicon
├── src/
│   ├── api/
│   │   └── client.ts        # Centralized Axios client & API service modules
│   ├── types/
│   │   └── index.ts         # TypeScript definitions matching backend Pydantic models
│   ├── context/
│   │   ├── AuthContext.tsx  # Authentication session, JWT storage, profile state
│   │   └── TwinContext.tsx  # Digital twin state, baseline status, demo seeding
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppShell.tsx # Responsive shell (desktop sidebar, mobile drawer, top header)
│   │   ├── ui/
│   │   │   ├── MetricCard.tsx      # Telemetry card with baseline delta chips & trends
│   │   │   ├── TwinStatusCard.tsx  # Hero digital twin card & demo seed CTA
│   │   │   ├── QualityBadge.tsx    # Pose tracking fidelity indicator badge
│   │   │   └── EmptyState.tsx      # High-tech empty state placeholder
│   │   └── charts/
│   │       └── TrendChart.tsx      # Recharts time-series curve with baseline bounds
│   ├── pages/
│   │   ├── LandingPage.tsx          # Public product & vision pipeline showcase
│   │   ├── LoginPage.tsx            # Athlete authentication
│   │   ├── RegisterPage.tsx         # Athlete onboarding with anthropometrics
│   │   ├── DashboardPage.tsx        # Telemetry monitor & recent sessions
│   │   ├── VideoUploadPage.tsx      # Drag-and-drop video upload & BlazePose progress
│   │   ├── SessionDetailPage.tsx    # HTML5 video playback & joint angle readouts
│   │   ├── SessionsHistoryPage.tsx  # Searchable & filterable session log
│   │   ├── DigitalTwinPage.tsx      # Immutable twin version history & baseline table
│   │   ├── MetricTrendsPage.tsx     # Recharts spline curves & trajectory slopes
│   │   ├── RecommendationsPage.tsx  # Gemini 3.8 Flash editorial coaching & drill cards
│   │   └── ProfileSettingsPage.tsx  # Anthropometrics editing & system architecture specs
│   ├── App.tsx              # Router configuration & protected route guard
│   ├── main.tsx             # React DOM entry point
│   └── index.css            # Tailwind CSS directives & color tokens
├── index.html               # HTML5 template with Inter font & dark theme
├── package.json             # NPM dependencies & scripts
├── vite.config.ts           # Vite bundler & dev server configuration
└── .env.example             # Environment variable template
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node.js v24)
- NPM v10+ (tested on NPM v11)
- Authoritative FastAPI backend running at `http://localhost:8000`

### 2. Environment Configuration
Create a `.env` file in the `web/` directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The website will start at:
- **Local**: `http://localhost:5173/`

### 5. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory.

---

## 🔐 Security & Architecture Rules
- **No Client Secrets**: The Gemini API key and database credentials remain strictly on the backend. The frontend never accesses or bundles private keys.
- **Authoritative Source of Truth**: The web client does not simulate or invent computer vision landmarks or baseline mathematics. It strictly displays the verifiable results computed by the OpenCV + BlazePose pipeline on the backend.
- **Longitudinal Focus**: The website emphasizes historical trajectory evolution (`v1 -> v2 -> ...`) rather than isolated single-session snapshots.
