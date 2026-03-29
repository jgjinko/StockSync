# API Requirements — StockSync

## Purpose
Define the headless backend API required to power the StockSync BI Dashboard. The API provides a unified data stream for a Next.js frontend, specifically optimized for shadcn/ui components (DataTables, Badges, and Charts).

## General Stack
- **Framework:** FastAPI (Python).
- **Communication:** JSON over HTTP.
- **Base URL:** `http://localhost:8000/api`.
- **CORS:** Enabled for `http://localhost:3000` to support Next.js local development.

## Required Endpoints

### 1. GET /inventory
Returns a list of unified inventory items reconciled from all connected channels.
- **Frontend Use:** Powers the shadcn `DataTable` and main inventory overview.
- **Query Parameters:**
  - `channel` (optional): Filter by platform (e.g., Shopify, Amazon, TikTok Shop).
  - `low_stock` (optional): Filter for items where `stock <= safetyStock`.
- **Response Format:** Array of objects using `camelCase` keys.

### 2. GET /inventory/{sku}
Returns comprehensive metrics for a specific product.
- **Frontend Use:** Powers the product "Deep Dive" page and detailed analytics cards.
- **Path Parameter:** `sku`.
- **Response Format:** Full item object including lead times and unit costs.

### 3. GET /analytics/heatmap
Returns geographic sales density data.
- **Frontend Use:** Powers the Mapbox GL JS integration for visual sales intelligence.
- **Response Format:** Array of coordinate pairs with weight values: `[{ "lat": float, "lng": float, "weight": float }]`.

### 4. GET /analytics/forecast/{sku}
Returns AI-driven reorder recommendations.
- **Frontend Use:** Powers predictive alert badges and "Suggested Action" blocks.
- **Response Format:** Object containing `days_of_cover` and `recommended_reorder_qty`.

## UI Integration Logic
The API includes a calculated `status` field for every item to simplify shadcn component styling:
- `in_stock`: Healthy levels.
- `low_stock`: Requires attention (mapped to warning badges).
- `out_of_stock`: Critical (mapped to destructive/red badges).