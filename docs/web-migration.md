# Web Migration Guide — Personal Sports Digital Twin

## 1. Migration Overview

The **Personal Sports Digital Twin** was originally developed as a Flutter application targeting mobile/desktop environments. This document explains the full conversion to a web frontend built with **React 18 + TypeScript + Vite + Tailwind CSS**, while maintaining the Flutter codebase in `mobile/` intact and fully functional.

---

## 2. Dual-Client Architecture

```
                                  +------------------------------------+
                                  |    FastAPI Authoritative Server    |
                                  |         (http://localhost:8000)    |
                                  +------------------------------------+
                                            /                 \
                     REST API & Video Upload /                   \ REST API & Video Upload
                                            v                     v
                +-------------------------------+     +-------------------------------+
                |   Flutter Client (`mobile/`)  |     |     React Web Client (`web/`) |
                |  - Material 3 Dark Theme      |     |  - React 18 + TypeScript      |
                |  - fl_chart                   |     |  - Vite 8 + Tailwind CSS v4   |
                |  - Multiplatform (Mobile/Web) |     |  - Recharts + Lucide Icons    |
                +-------------------------------+     +-------------------------------+
```

Both clients share the **same backend, same database, same mathematical baseline models, and same computer vision pipeline**.

---

## 3. Flutter to React Component Mapping

| Flutter Screen / Widget | React Component / Page | Location |
|---|---|---|
| `TwinDashboardScreen` | `DashboardPage` | `web/src/pages/DashboardPage.tsx` |
| `VideoUploadScreen` | `VideoUploadPage` | `web/src/pages/VideoUploadPage.tsx` |
| `SessionDetailScreen` | `SessionDetailPage` | `web/src/pages/SessionDetailPage.tsx` |
| `SessionHistoryScreen` | `SessionsHistoryPage` | `web/src/pages/SessionsHistoryPage.tsx` |
| `DigitalTwinScreen` | `DigitalTwinPage` | `web/src/pages/DigitalTwinPage.tsx` |
| `MetricTrendsScreen` | `MetricTrendsPage` | `web/src/pages/MetricTrendsPage.tsx` |
| `RecommendationsScreen` | `RecommendationsPage` | `web/src/pages/RecommendationsPage.tsx` |
| `DeviationsScreen` | Integrated in `MetricTrendsPage` & `DashboardPage` | `web/src/pages/MetricTrendsPage.tsx` |
| `ProfileScreen` | `ProfileSettingsPage` | `web/src/pages/ProfileSettingsPage.tsx` |
| `LoginScreen` | `LoginPage` | `web/src/pages/LoginPage.tsx` |
| `RegisterScreen` | `RegisterPage` | `web/src/pages/RegisterPage.tsx` |
| `TwinStatusCard` | `TwinStatusCard` | `web/src/components/ui/TwinStatusCard.tsx` |
| `MetricCard` | `MetricCard` | `web/src/components/ui/MetricCard.tsx` |
| `QualityBadge` | `QualityBadge` | `web/src/components/ui/QualityBadge.tsx` |
| `TrendChart` (fl_chart) | `TrendChart` (Recharts) | `web/src/components/charts/TrendChart.tsx` |
| `EmptyStateCard` | `EmptyState` | `web/src/components/ui/EmptyState.tsx` |

---

## 4. Key Engineering Adaptations

### 1. Web File I/O vs Native File System
- **Native / Mobile**: Accesses local file system paths via `dart:io File(path)`.
- **Web**: Accesses browser memory buffer via HTML5 `<input type="file">` / drag-and-drop `File` / `FormData`.
- **Solution**: The web frontend uses `FormData.append('file', file)` transmitted via Axios `multipart/form-data`. The backend saves and validates files in `uploads/` without client filesystem dependencies.

### 2. Video Preview Playback
- To allow the web client to play ingested movement videos directly in the browser:
- `backend/app/main.py` was updated with `app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")`.
- The web client streams directly from `http://localhost:8000/uploads/{video_filename}` via standard HTML5 `<video controls>`.

### 3. Responsive Web Layout
- **Desktop (≥ 1024px)**: Persistent left sidebar navigation with athletic branding, top telemetry bar with real-time backend health check, multi-column telemetry grids.
- **Tablet (768px – 1023px)**: Adaptive 2-column cards and charts.
- **Mobile (< 768px)**: Slide-out hamburger navigation drawer, touch-friendly dropzone, horizontally scrollable tables and metric choice chips.

---

## 5. Verification Checklist

- [x] Flutter app remains intact in `mobile/`.
- [x] Dedicated web app scaffolded in `web/`.
- [x] `npm run build` succeeds with zero errors (`✓ built in 1.18s`).
- [x] `pytest` passes 10/10 automated tests (`10 passed in 75.70s`).
- [x] Web dev server running live on `http://localhost:5173`.
- [x] Backend running live on `http://localhost:8000`.
- [x] All 10 web pages implemented and verified.
- [x] Gemini credentials kept strictly on backend.
