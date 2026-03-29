# UI Components — StockSync

## Component Strategy
We utilize **shadcn/ui** as the foundational library. Every component listed below is built on top of shadcn primitives for accessibility and speed.

## 1. InventoryTable (`shadcn/ui Data Table`)
The core of the `/inventory` page.
- **Features:** Sorting by stock level, filtering by channel.
- **Customization:** Custom cell renderer for the "Status" column to display colored badges.

## 2. StatusBadge (`shadcn/ui Badge`)
A semantic indicator of inventory health.
- `Variant: Outline + Green` -> In Stock
- `Variant: Secondary + Amber` -> Low Stock
- `Variant: Destructive` -> Out of Stock

## 3. MetricCard (`shadcn/ui Card`)
Used on the dashboard for high-level KPIs.
- Includes a title, a large value, and a small trend indicator (e.g., "+12% vs last week").

## 4. HeatmapContainer
A custom component wrapping **Mapbox GL JS**.
- Consumes the `/api/analytics/heatmap` endpoint.
- Visualizes sales density to assist in inventory distribution decisions.

## 5. ForecastWidget
A specialized card for the Detail page.
- Displays "Days of Cover" as a progress bar or countdown.
- Contains a "Recommended Action" button (e.g., "Generate Purchase Order").

## Component Rules
- **DRY:** Use the same `StatusBadge` logic in the Table and the Detail page.
- **Loading States:** Use shadcn `Skeleton` loaders for the Heatmap and Table while data is fetching from the FastAPI backend.