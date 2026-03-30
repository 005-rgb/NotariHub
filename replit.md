# Notaris - Multi-tenant SaaS Platform for Notaries

## Overview
A multi-tenant SaaS platform for Indonesian notary offices. Provides legal document (folder) management, subscription handling, AI-powered OCR and legal drafting, and client communication features.

## Architecture
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Vite (served via Express middleware)
- **Backend**: Node.js + Express (TypeScript, runs with `tsx`)
- **Single server**: Express handles both API routes and serves the Vite dev/built frontend
- **Database**: In-memory mock database (defined in `server.ts`)
- **AI**: Google Generative AI (`@google/genai`) for OCR and drafting features
- **Payments**: Midtrans (Indonesian payment gateway)

## Project Structure
- `server.ts` — Express server entry point with API routes and mock data
- `src/` — React frontend source
  - `App.tsx` — Main routing and role-based access
  - `components/` — UI components (Dashboard, Sidebar, AI tools, etc.)
  - `context/` — React Context providers (feature flags, etc.)
  - `lib/` — Utility classes and API clients
  - `services/` — External integration services (Midtrans, QuotaGuard)
  - `types/` — TypeScript type definitions
- `vite.config.ts` — Vite bundler configuration
- `index.html` — Frontend entry point

## Key Features
- **Multi-tenancy**: Tenant isolation via `x-tenant-id` headers
- **Subscription plans**: BASIC, PREMIUM, ENTERPRISE with feature gating
- **Role-based access**: NOTARIS, STAF_UTAMA, SUPER_ADMIN roles
- **Legal workflow**: Tracks folders through milestones (Validasi Pajak, Minuta, etc.)
- **Consumer Directory** (`/consumers`): Full-featured virtualized table with incremental search, katalog/year filters, action buttons (WhatsApp, Print, Edit), and ConsumerDetailDrawer integration. Uses `react-window` + `react-virtualized-auto-sizer` for 60fps virtual scrolling at scale. RBAC: Edit button only visible for NOTARIS role.
- **AI OCR**: Document text extraction (PREMIUM/ENTERPRISE only)
- **Client portal**: Auto-generated credentials for consumer document tracking

## Development
- **Start**: `npm run dev` (runs `tsx server.ts`)
- **Port**: 5000 (configured via `PORT` env var or defaults to 5000)
- **Build**: `npm run build` (Vite build to `dist/`)

## Deployment
- Target: autoscale
- Build: `npm run build`
- Run: `node --import tsx/esm server.ts`
- Production serves built `dist/` as static files

## Environment Variables
- `GEMINI_API_KEY` — Google Generative AI API key (for AI OCR/drafting features)
- `PORT` — Server port (defaults to 5000)
