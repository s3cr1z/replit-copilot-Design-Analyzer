# Copilot - Personal Finance App

## Platform Decision (Path A)
This project is intentionally **web-only**. It is a Vite-powered React web app and is **not** an Expo/React Native app and is **not** intended to run in Expo Go.

## Overview
A Copilot-inspired personal finance dashboard built with React, Express, and TypeScript. Features a deep navy dark-mode design with real-time financial tracking.

## Architecture

### Platform boundaries and dependency ownership
- `client/`: web UI built for browsers using React + Vite and web-specific UI dependencies (shadcn/ui + Radix).
- `server/`: Express API and server runtime responsibilities (`/api/*`, request handling, data orchestration).
- `shared/`: cross-platform TypeScript contracts and schema definitions shared by client/server (for example, `shared/schema.ts`).
- Mobile support means **mobile browsers** (Safari/Chrome), not a native mobile runtime.

### Frontend
- React with TypeScript (Vite)
- wouter for routing
- TanStack Query for data fetching
- recharts for data visualization
- shadcn/ui components
- Always dark mode (navy theme)

### Backend
- Express.js REST API
- In-memory storage (MemStorage) seeded with realistic demo data
- Routes under `/api/`

## Key Pages
- `/` - Dashboard: spending chart, budget circles, net this month, upcoming recurring
- `/transactions` - Transaction list with search, filter by category, add/delete/review
- `/reports` - Cash Flow / Accounts / Investments (sub-tabbed)
- `/categories` - Budget categories with progress bars
- `/recurring` - Upcoming scheduled payments

## Design
- Deep navy background: `hsl(222 47% 5%)`
- Card background: `hsl(222 42% 8%)`
- Always dark mode (no light mode toggle)
- Blue primary for active states
- Green for income/positive, red for over-budget
- Inter font

## API Endpoints
- `GET /api/transactions` - All transactions sorted by date
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/budgets` - Budget categories
- `GET /api/accounts` - Linked accounts
- `GET /api/investments` - Investment holdings
- `GET /api/recurring` - Recurring items
- `GET /api/dashboard/stats` - Dashboard summary stats

## Mobile testing (web)

### iPhone Safari manual test steps
1. Start the app with `npm run dev`.
2. On iPhone, open Safari and navigate to the dev URL (same network) or deployed URL.
3. Verify core flows: Dashboard charts, Transactions add/delete, Reports tabs, Categories progress, Recurring list.
4. Rotate portrait/landscape and confirm layout remains usable without horizontal clipping.
5. Confirm touch targets (buttons, tabs, filters) are responsive and readable in dark mode.

### Supported mobile browser versions
- iOS Safari: latest 2 major iOS releases (Safari engine for iOS 17+).
- iOS Chrome: latest 2 major releases (WebKit on iOS).
- Android Chrome: latest 2 major stable releases.

## Data
All data is in-memory and seeded at startup with realistic demo data (no database needed for this MVP).

## Accessibility Note
- Do not disable pinch-to-zoom on mobile. Keep the viewport meta tag as `width=device-width, initial-scale=1.0` and avoid `maximum-scale=1` or `user-scalable=no`, so users can zoom when needed (especially on iPhone Safari).

## Version Control / Git Remote

The Replit project is connected to GitHub via the `[gitHubImport]` section in `.replit`:

```
repoUrl = "https://github.com/s3cr1z/replit-copilot-Design-Analyzer"
```

To verify the remote from within the Replit shell:

```bash
git remote -v
```

Expected output:
```
origin  https://github.com/s3cr1z/replit-copilot-Design-Analyzer (fetch)
origin  https://github.com/s3cr1z/replit-copilot-Design-Analyzer (push)
```

If the remote is missing (e.g. after a fresh Replit import), run:

```bash
git remote add origin https://github.com/s3cr1z/replit-copilot-Design-Analyzer
```
