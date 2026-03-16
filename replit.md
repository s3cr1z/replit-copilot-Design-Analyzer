# Copilot - Personal Finance App

## Overview
A Copilot-inspired personal finance dashboard built with React, Express, and TypeScript. Features a deep navy dark-mode design with real-time financial tracking.

## Architecture

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

## Data
All data is in-memory and seeded at startup with realistic demo data (no database needed for this MVP).

## Typography dependency
- **Primary web font:** `Inter` (loaded from Google Fonts in `client/index.html`).
- **Tailwind mapping:** `font-sans` resolves to `var(--font-sans)` and `--font-sans` is set to `Inter, sans-serif`, so the app typography remains unchanged after trimming the Google Fonts request.
- **Fallbacks:** `--font-serif` (`Georgia, serif`) and `--font-mono` (`Menlo, monospace`) are system stacks and do not require additional remote font downloads.
- **Why this set:** the UI design uses Inter for most text and relies on system fallbacks for serif/mono contexts, so removing unused hosted families reduces first-load font payload and avoids unnecessary network requests.
