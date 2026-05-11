# Apply StockSync Inventory Data to Frontend Template

## Background

The frontend is a **VisActor + Next.js dashboard template** originally themed as a "ticketing/helpdesk" dashboard. It needs to be transformed into the **StockSync multi-channel inventory intelligence dashboard** using real data from `Data/inventory_data.json` (100 SKU records across Shopify, Amazon, TikTok Shop, and Physical POS).

The template has 5 data files driving 5 chart/widget blocks. We need to re-map each to StockSync-relevant inventory analytics while preserving the existing chart architecture (VChart/VisActor).

## Proposed Changes

### Data Mapping Strategy

The template's original data → StockSync equivalent:

| Template Data File | Original Purpose | StockSync Purpose |
|---|---|---|
| `metrics.ts` | Created/Unsolved/Resolved Tickets + Reply Time | **KPI Cards**: Total SKUs, In Stock, Low Stock, Out of Stock |
| `ticket-by-channels.ts` | Ticket distribution by channel (pie chart) | **Inventory by Channel**: Shopify, Amazon, TikTok Shop, Physical POS (pie chart) |
| `average-tickets-created.ts` | Daily tickets created/resolved (bar chart) | **Stock Levels by Category**: Available vs Reserved per product category (bar chart) |
| `convertions.ts` | Sales by city (circle packing) | **Inventory Value by Category**: Total retail value per product category (circle packing) |
| `customer-satisfication.ts` | Positive/Neutral/Negative satisfaction | **Stock Health**: In Stock / Low Stock / Out of Stock percentages (progress bars) |

---

### Component 1: Data Files (`src/data/`)

#### [MODIFY] `metrics.ts`
Replace ticket metrics with inventory KPIs computed from the real dataset:
- **Total SKUs** (count of all items)
- **In Stock** (count where available > safety threshold)
- **Low Stock** (count where available > 0 but ≤ safety threshold)
- **Out of Stock** (count where available = 0)

#### [MODIFY] `ticket-by-channels.ts` → rename to `inventory-by-channels.ts`
Replace ticket channels with inventory distribution by sales channel:
- Count SKUs per channel: Shopify, Amazon, TikTok Shop, Physical POS

#### [MODIFY] `average-tickets-created.ts` → rename to `stock-by-category.ts`
Replace daily ticket data with stock levels grouped by product category (Apparel, Electronics, Accessories, etc.), showing `available` vs `reserved` totals per category.

#### [MODIFY] `convertions.ts` → rename to `inventory-value-by-category.ts`
Replace city-based conversions with total inventory retail value per product category.

#### [MODIFY] `customer-satisfication.ts` → rename to `stock-health.ts`
Replace customer satisfaction ratios with stock health percentages (in_stock / low_stock / out_of_stock proportions) and total active SKUs.

#### [NEW] `inventory.ts`
The preprocessed inventory dataset with all 100 records, applying the StockSync preprocessing pipeline rules:
- `abs()` on negative values
- Null handling
- Status tagging (`inStock`, `lowStock`, `outOfStock`)
- camelCase field mapping

---

### Component 2: Type Definitions (`src/types/`)

#### [MODIFY] `types.ts`
Replace `TicketMetric` with `InventoryItem` and `StockMetric` types matching the preprocessed inventory data.

---

### Component 3: State Management (`src/lib/`)

#### [MODIFY] `atoms.ts`
Replace ticket-based Jotai atoms with inventory-aware atoms:
- Category filter atom
- Filtered stock data atom for the bar chart

---

### Component 4: Chart Components (`src/components/chart-blocks/`)

#### [MODIFY] `index.tsx` — Update exports to use new component names

#### Metrics Block (`charts/metrics/`)
- [MODIFY] `index.tsx` — Reference new `metrics` data
- [MODIFY] `components/metric-card.tsx` — Keep structure, update "Compare to last month" text to "Inventory Status"

#### Average Tickets → Stock by Category (`charts/average-tickets-created/`)
- [MODIFY] `index.tsx` — Rename to "Stock Levels by Category", update metric cards to show Avg Available/Avg Reserved
- [MODIFY] `chart.tsx` — Update bar chart fields from date/count/type to category/value/type

#### Conversions → Inventory Value (`charts/conversions/`)
- [MODIFY] `index.tsx` — Rename to "Inventory Value by Category", update total label
- [MODIFY] `chart.tsx` — Update circle packing data source

#### Ticket by Channels → Inventory by Channel (`charts/ticket-by-channels/`)
- [MODIFY] `index.tsx` — Rename to "Inventory by Channel"
- [MODIFY] `chart.tsx` — Update pie chart to use channel distribution data, change center label to "Total Active SKUs"

#### Customer Satisfaction → Stock Health (`charts/customer-satisfication/`)
- [MODIFY] `index.tsx` — Rename to "Stock Health Overview", update icons and labels (In Stock ✓, Low Stock ⚠, Out of Stock ✗)

---

### Component 5: Navigation & Config

#### [MODIFY] `config/site.tsx`
- Rename app title to "StockSync" 
- Rename nav items: "Dashboard" stays, "Ticket" → "Inventory"
- Use `Package` and `LayoutDashboard` icons from lucide

#### [MODIFY] `app/(dashboard)/layout.tsx` — Update title to "Dashboard"
#### [MODIFY] `app/ticket/layout.tsx` — Update title to "Inventory"

---

### Component 6: Dashboard Page

#### [MODIFY] `app/(dashboard)/page.tsx`
- Update component names to match the renamed chart blocks

---

## Implementation Sequence

1. Create the preprocessed inventory data file (`inventory.ts`)
2. Update all 5 data files with StockSync-derived data
3. Update types
4. Update atoms/state management
5. Update all chart components
6. Update config, navigation, and page layouts
7. Verify the build compiles

## Verification Plan

### Automated Tests
- Run `npm run build` in the frontend directory to verify there are no TypeScript or build errors

### Manual Verification
- Run `npm run dev` and visually inspect the dashboard in the browser
