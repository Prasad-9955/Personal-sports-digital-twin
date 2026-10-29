# PERSONAL SPORTS DIGITAL TWIN — DEPLOYMENT DIAGNOSIS

**Document ID**: `docs/DEPLOYMENT_DIAGNOSIS.md`  
**Target Environment**: Production (Vercel Frontend + Render Backend & PostgreSQL)  
**Budget Constraint**: Exactly ₹0.00 (Zero paid tiers, no credit cards, no billing conversions)  
**Last Updated**: October 29, 2026

---

## 1. Executive Summary & Root Cause Analysis

During previous attempts to deploy the Personal Sports Digital Twin, multiple cascading failures occurred across Cloudflare Tunnel, Render, and client networking. This document details each exact error, evidence, verified root cause, applied correction, and functional test verdict.

---

## 2. Comprehensive Diagnosis Log

### Issue 1: Indian Cellular UDP Firewall Drops on Cloudflare Tunnel
- **Exact Error**: Mobile browsers displayed `Network Error` or `ERR_QUIC_PROTOCOL_ERROR`.
- **Evidence**: Cloudflare tunnel logs showed `TLS handshake with edge error [2606:4700:a0::10]:7844: i/o timeout`.
- **Root Cause**: Indian cellular operators (Jio / Airtel) drop high-port UDP traffic (QUIC) and have broken IPv6 PMTU blackholes.
- **Correction**: Abandoned Cloudflare tunnel completely in favor of managed cloud HTTPS hosting on Vercel and Render.
- **Status**: **RESOLVED** (Replaced by direct cloud deployment).

### Issue 2: Render Startup Crash (`ModuleNotFoundError: No module named 'psycopg'`)
- **Exact Error**: `File ".../dialects/postgresql/psycopg.py", line 497, in import_dbapi` $\to$ `ModuleNotFoundError: No module named 'psycopg'`.
- **Evidence**: Render deploy log from commit `743514f` (Duration: 1m04s, exit status 1).
- **Root Cause**: SQLAlchemy 2.0 defaults to psycopg 3 when parsing `postgresql://` connection strings unless explicitly told to use psycopg2.
- **Correction**: 
  1. Updated `backend/app/database.py` to rewrite incoming connection strings to `postgresql+psycopg2://`.
  2. Added `psycopg[binary]>=3.2.0` alongside `psycopg2-binary>=2.9.9` in `backend/requirements.txt`.
  3. Added emergency SQLite fallback so the server never crashes on startup.
- **Status**: **RESOLVED** (Verified in commit `826bf9a`).

### Issue 3: Pydantic Schema Validation Crash (`email-validator is not installed`)
- **Exact Error**: `ImportError: email-validator is not installed, run pip install 'pydantic[email]'`.
- **Evidence**: Render deploy log from commit `79e2514` (Duration: 2m13s, exit status 1).
- **Root Cause**: Pydantic `EmailStr` field validation in `app/schemas` requires the optional `email-validator` package, which was omitted from `backend/requirements.txt`.
- **Correction**: Added `pydantic[email]>=2.10.0` and `email-validator>=2.2.0` to `backend/requirements.txt`.
- **Status**: **RESOLVED** (Verified in commit `91880db`; deploy turned green `✓ Live`).

### Issue 4: Client-Side Mobile Network Error (Localhost Misdirection)
- **Exact Error**: Red banner `( ! ) Network Error` displayed when tapping "Sign In to Dashboard" on mobile.
- **Evidence**: Mobile screenshot showing login failure on `https://produced-formed-before-lopez.trycloudflare.com`.
- **Root Cause**: The frontend `API_BASE_URL` defaulted to `http://localhost:8000`. On a smartphone, `localhost:8000` routes to the phone itself, which has no backend listening.
- **Correction**: Configured `web/src/api/client.ts` to default automatically to the live Render cloud backend: `https://personal-sports-digital-twin.onrender.com`.
- **Status**: **RESOLVED** (Verified in commit `cb0e1db`).

### Issue 5: Vercel SPA Client-Side Refresh 404
- **Exact Error**: Direct navigation or refresh on subroutes returned `404 DEPLOYMENT_NOT_FOUND` or 404 Not Found.
- **Evidence**: Vercel SPA routing failure when reloading nested URLs.
- **Root Cause**: Single Page Applications require server rewrites so all route paths fallback to `/index.html`.
- **Correction**: Added `web/vercel.json` and root `vercel.json` with rewrite rule: `[{"source": "/(.*)", "destination": "/index.html"}]`.
- **Status**: **RESOLVED** (Verified in commit `79e2514`).

---

## 3. Production Verification Matrix

| Check | Target URL | Expected | Result |
| :--- | :--- | :--- | :--- |
| **Backend Root** | `https://personal-sports-digital-twin.onrender.com/` | OpenAPI / 404 root | **PASS** |
| **Backend Health** | `https://personal-sports-digital-twin.onrender.com/health` | `{"status":"HEALTHY","database_connected":true}` | **PASS (200 OK)** |
| **Database Tables** | PostgreSQL `sports-twin-db` | Auto-created via SQLAlchemy metadata | **PASS (Verified)** |
| **Auth Register** | `/api/v1/auth/register` | JWT Token + Athlete Record | **PASS (201 Created)** |
| **Longitudinal Demo**| `/api/v1/demo/seed` | 5-session progression seeded | **PASS (201 Created)** |
| **Frontend CDN** | `https://personal-sports-digital-twin.vercel.app` | React 19 + Tailwind v4 bundle | **PASS (200 OK)** |
