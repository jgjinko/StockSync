# UI Screens and Flow — StockSync

## Purpose of this document
This document defines the user journey and structural layout for the StockSync BI platform. It is designed for a **Next.js** implementation utilizing **shadcn/ui** and **Mapbox GL JS** for high-performance data visualization.

## Overview of Screens
The platform is organized into five core functional areas to provide a complete "Source of Truth" for multi-channel inventory.
1. **Executive Dashboard:** High-level KPIs and business health metrics.
2. **Unified Inventory Catalog:** Centralized data table for stock management.
3. **SKU Intelligence (Details):** Deep-dive analytics and predictive forecasting.
4. **Geographic Intelligence (Map):** Spatial analysis of sales density and market trends.
5. **Channel Management:** Integration status and health for external platforms.

---

## Screen 1 — Executive Dashboard (`/dashboard`)
**Purpose:** Provide an immediate pulse-check on business performance and stock risks.
- **Top Bar:** Search (Global SKU search), Notifications (Alerts for stockouts/delays), and User Settings.
- **KPI Summary (shadcn Cards):**
    - **Total Inventory Value:** Aggregated COGS across all channels.
    - **Critical Stockouts:** Count of SKUs currently at zero.
    - **Revenue at Risk:** Estimated value of lost sales due to low inventory levels.
    - **Top Velocity Channel:** The sales platform with the highest 7-day volume.
- **Main View:**
    - **Map Preview:** A compact heatmap visualization of geographic order density.
    - **Top Movers:** A bar chart showcasing the fastest-selling SKUs by volume.

---

## Screen 2 — Unified Inventory Catalog (`/inventory`)
**Purpose:** Manage stock levels across Shopify, Amazon, TikTok Shop, and other platforms in a single interface.
- **Filter Header:**
    - Search field for SKU or product names.
    - Selectors for **Channel** (filtering by specific platform) and **Product Category**.
    - Toggle switch for "Critical Items Only."
- **Inventory DataTable (shadcn):**
    - **Columns:** SKU, Product Name, Channel Badge, Current Stock, Safety Stock, Status Badge (In Stock / Low / Critical), Unit Cost.
    - **Interaction:** Row selection highlights the item; clicking redirects to the **SKU Intelligence** page.

---

## Screen 3 — SKU Intelligence (`/inventory/[sku]`)
**Purpose:** Provide data-driven insights for specific product reordering and performance monitoring.
- **Header:** Product Title, SKU identifier, and "Last Sync" timestamp.
- **Grid Layout (2-Column):**
    - **Left Section (Status):** Real-time stock distribution by channel and platform-specific metrics.
    - **Right Section (Predictive):**
        - **Days of Cover:** A countdown metric indicating when the product is projected to hit zero stock.
        - **Suggested Reorder Card:** Automatically calculated "Recommended Reorder Quantity" based on velocity and lead times.
- **Bottom Section:** A trend line chart showing sales velocity fluctuations over the past 30 days.

---

## Screen 4 — Geographic Intelligence (`/analytics/map`)
**Purpose:** Visualize spatial demand to optimize logistics and marketing spend.
- **Full-Screen Map (Mapbox):**
    - Heatmap layer showing order concentration.
    - Cluster markers representing order volume in specific urban centers or regions.
- **Sidebar Analytics Overlay:**
    - **Top Regions:** A ranked list of the highest-performing geographic zones.
    - **Distribution Insights:** Recommendations for shifting stock closer to high-demand areas.

---

## Screen 5 — Channel Management (`/settings/channels`)
**Purpose:** Monitor and configure the health of third-party API connections.
- **Integration Cards:**
    - **Shopify:** Connection status and last webhook received.
    - **Amazon SP-API:** Connection health and sync latency tracking.
    - **TikTok Shop:** Status indicator with alerts for expired authentication tokens.
- **Global Configuration:** Controls for sync frequency and base currency settings.

---

## Navigation Flow
1. **Monitoring:** The user begins on the **Dashboard** to identify any "Revenue at Risk" or critical stockout events.
2. **Investigation:** Clicking a KPI card redirects the user to the **Inventory Catalog**, pre-filtered to show items requiring attention.
3. **Decision:** The user selects a specific product to view **SKU Intelligence**, comparing sales velocity against current lead times.
4. **Strategy:** The user accesses the **Geographic Map** to determine where demand is growing, using this data to adjust advertising or stock distribution.

## Implementation Guidelines
- **Responsive Layout:** The Sidebar collapses on smaller screens; DataTables utilize horizontal scrolling for data preservation.
- **Semantic Status:** Use `destructive` variants for Critical/Out of Stock, `warning` for Low Stock, and `success` for Healthy Stock levels.
- **Loading Architecture:** Implement Next.js `loading.tsx` skeletons for heavy data components like the Mapbox container and the primary DataTable.