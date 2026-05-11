# FINANCE_HUB_PLAN

## Executive Summary
The Financial Intelligence Hub serves as the "Profitability Engine" for the StockSync platform. This mission-critical dashboard extends the system beyond simple stock counting into actionable financial intelligence. By reconciling real-time sales data across Shopify, Amazon, and TikTok Shop against accurate Cost of Goods Sold (COGS) and platform-specific fees, the Hub provides merchants with a unified, real-time picture of their true margins, revenue streams, and capital allocation (such as Dead Stock Value). The primary objective is to empower dynamic, fast decision-making to maximize profitability.

## Data Flow Architecture
To maintain the strict separation dictated by StockSync's Headless Architecture and ensure high-performance data processing:

1. **Local Preprocessing (Data Source):** During the MVP, the mock source of truth will be `inventory_data.json`. The `preprocessing.py` script ensures data integrity, resolving negative inventory counts and harmonizing channel specifics.
2. **FastAPI Backend (Calculations & Aggregations):** 
   - **Sales Aggregation:** Background tasks (or simulated events) poll the dataset to generate sales events for the 15s latency ticket.
   - **Financial Engine:** The backend computes gross sales, applies unit costs, calculates platform fees, and deducts shipping to yield Net Margin, AOV, and Dead Stock Value. 
   - **Endpoints:** 
     - `/api/finance/ticker` (yielding simulated live transactions).
     - `/api/finance/trends` (serving time-series aggregations).
     - `/api/finance/matrix` (cross-channel breakdown).
     - `/api/finance/kpi` (summary metrics).
3. **Next.js Frontend (Presentation Layer):** The Next.js UI queries the FastAPI backend via Axios/Fetch, leveraging React state and SWR/React Query for real-time polling (15s intervals). It translates the aggregated JSON payloads into dynamic visual components without executing heavy business logic.

## Component Strategy
Consistent with our high-density UI guidelines, we will leverage **shadcn/ui** components and Tailwind CSS heavily.

- **Live Revenue Stream (Ticker):** 
  - *Component:* Custom `ScrollArea` wrapping customized `Card` or `Alert` elements. Alternatively, a specialized `DataTable` if high-density scanning is preferred.
- **Time-Series Analytics:** 
  - *Component:* `Tabs` or `ToggleGroup` for selecting time ranges (24H, 7D, 30D, YTD). Recharts-based `AreaChart` and `BarChart` components integrated seamlessly through the UI layer to visualize Revenue and Profit curves over time.
- **Cross-Channel Performance Matrix:** 
  - *Component:* `Table` or an advanced `DataTable` displaying rows for each channel (Shopify, Amazon, TikTok). Columns will include Gross Revenue, Platform Fees, Unit Costs, and ROI Scores.
- **Advanced BI Widgets:** 
  - *Component:* A responsive grid of `MetricCards` (incorporating `CardHeader`, `CardTitle`, and `CardContent`) to display **Net Margin Tracker**, **Average Order Value (AOV)**, and **Dead Stock Value** with dynamic trend indicators (Green/Amber/Red text metrics based on backend-calculated status).

## Incremental Workflow (Step-by-Step)

### Task 1: Backend FastAPI logic & frontend "Live Ticker"
- **Backend:** Create a `/api/finance/ticker` endpoint. Parse `inventory_data.json` to simulate recent sales events, ensuring they are standardized with `sku`, `channel`, `gross_value`, and timestamp.
- **Frontend:** Build the "Live Revenue Stream" component. Implement a polling mechanism (e.g., `setInterval` or SWR) that fetches new data every 15 seconds and softly animates new entries into a scrolling list.

### Task 2: Time-Series filters and line/bar charts
- **Backend:** Develop the `/api/finance/trends` endpoint, accepting a `timeframe` query parameter (24h, 7d, 30d, ytd). Return aggregated time-series buckets detailing gross revenue and net profit.
- **Frontend:** Integrate Recharts (`AreaChart` for cumulative/trend revenue and `BarChart` for bucketed profit). Add the `ToggleGroup` for dynamic timeframe switching and hook it up to state to re-fetch/filter data smoothly.

### Task 3: The Channel Comparison logic
- **Backend:** Build out the core calculus engine and expose `/api/finance/matrix`. Calculate standard fees per platform, deduct global `unit_cost` referencing the catalog, and formulate the final ROI score natively in Python to send to the UI.
- **Frontend:** Construct the "Cross-Channel Performance Matrix" using the shadcn/ui `Table`. Ensure positive/negative ROI visual indicators are tied accurately to the API response.

### Task 4: Final assembly of Advanced BI Widgets
- **Backend:** Develop the `/api/finance/kpi` endpoint. 
  - Calculate *Net Margin* (Gross Sales - (COGS + Fees + Shipping)).
  - Calculate *AOV* (Total Revenue / Total Orders).
  - Calculate *Dead Stock Value* (Sum of `unit_cost * inventory_count` for items passing the zero-velocity threshold).
- **Frontend:** Implement the MetricCards grid. Polish the UI with refined typography, subtle tooltips (`TooltipProvider`), and ensure responsive behavior across device profiles.

## Technical Constraints
- **SKU-Primary:** All incoming transaction data, COGS calculations, and dead stock valuations must rigidly relate to the global `sku` identity. The `unit_cost` tied to the SKU dictates all profitability logic.
- **Local-First:** To ensure MVP deliverability, all API logic must function against a purely local execution reading from `inventory_data.json` before any real third-party API integration takes place.
- **Clean UI:** Strictly adhere to the project's modern design aesthetics. Rely on Tailwind CSS utility classes and unmodified shadcn/ui primitives to avoid styling drift and maintain premium visual consistency.
