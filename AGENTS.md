# AGENTS.md — StockSync Platform

## Project Goal
Build a Multi-Channel Inventory Intelligence platform that:
- Unifies stock data from Shopify, Amazon, and TikTok Shop.
- Provides a "Source of Truth" through a 7-step data reconciliation pipeline.
- Visualizes sales density using Mapbox heatmaps.
- Offers predictive "Days of Cover" and reorder recommendations.

## Tech Stack
- **Backend:** Python + FastAPI (Headless API).
- **Frontend:** Next.js + Tailwind CSS + shadcn/ui.
- **Visuals:** Mapbox GL JS for geographic intelligence.
- **Data:** JSON-based local dataset with automated preprocessing.

## Key Directories
- `backend/` — FastAPI application and logic.
- `data/` — Unified inventory JSON records.
- `docs/` — Comprehensive project specifications (Concept, UI, API).
- `frontend/` — Next.js application (to be initialized).

## Rules for AI Coding Agents
1. **Headless Architecture:** Maintain a strict separation between the FastAPI logic and the Next.js UI.
2. **Data Integrity:** - Always run the `preprocessing.py` pipeline at startup.
   - Use the `sku` as the immutable primary key.
   - Convert all negative inventory values to positive via `abs()`.
3. **UI Consistency:**
   - Use **shadcn/ui** components exclusively for the dashboard.
   - Drive all status badges (Green/Amber/Red) using the `status` field calculated by the backend.
4. **Local First:** Ensure the entire stack remains runnable locally without requiring live third-party API keys for the MVP.

## Typical Tasks
- Implement FastAPI endpoints for specific SKU analytics.
- Build the `DataTable` component in Next.js with channel filtering.
- Integrate Mapbox to consume the `/api/analytics/heatmap` endpoint.
- Develop the "Days of Cover" predictive calculation in the backend.

## Output Expectations
- Keep code modular and clean for high-density data handling.
- Use camelCase for JSON keys sent to the frontend.
- Document any new environmental variables in the README.