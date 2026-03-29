# Development Roadmap — StockSync

## Phase 1 — Data & API Foundation
- [ ] Initialize repository with FastAPI and Next.js structure.
- [ ] Implement `preprocessing.py` logic.
- [ ] Develop `/api/inventory` and `/api/inventory/{sku}` endpoints.

## Phase 2 — Core Dashboard UI
- [ ] Setup shadcn/ui library in Next.js.
- [ ] Build the Inventory `DataTable` with channel filtering.
- [ ] Implement Status Badges (Green/Yellow/Red) based on API data.

## Phase 3 — Geographic Intelligence
- [ ] Integrate Mapbox GL JS into the frontend.
- [ ] Connect `/api/analytics/heatmap` to the map component.
- [ ] Implement geographic filtering (zoom-to-cluster).

## Phase 4 — Predictive Modeling
- [ ] Implement baseline "Days of Cover" logic in the backend.
- [ ] Build "Predictive Reorder" cards in the Product Deep-Dive view.
- [ ] (Optional) Integrate OpenAI API for natural language inventory insights.

## Success Criteria
- Dashboard load time < 2.5s.
- Successful reconciliation of at least three distinct sales channels.
- Real-time status updates for low-stock items.