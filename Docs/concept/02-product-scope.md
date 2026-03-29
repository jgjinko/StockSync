# Product Scope — StockSync

## Scope Objective
Deliver a locally runnable BI platform that unifies stock data and provides geographic and predictive insights. The focus is on data integrity and clear dashboard visualization.

## In Scope
### 1. Unified Data Layer
- Implementation of the 7-step preprocessing pipeline to clean and unify platform data.
- Stable SKU-based identification system.

### 2. BI Dashboard (Frontend)
- **Inventory Overview:** A shadcn `DataTable` with filtering by channel and status.
- **Geographic Intelligence:** Mapbox-powered heatmap for sales density.
- **Product Deep-Dive:** Detail pages for specific SKUs showing cost, price, and velocity.

### 3. Predictive Analytics (Baseline)
- Calculation of "Days of Cover" based on 7-day sales velocity.
- Low-stock alerting based on safety stock thresholds.

## Out of Scope (Future Phases)
- Multi-factor authentication (MFA) and user roles.
- Direct API write-backs to Shopify/Amazon (Read-only MVP).
- Advanced voice-query processing (Natural Language to SQL).

## Feature Prioritization
1. Data Reconciliation Pipeline (`preprocessing.py`).
2. Headless API Development (FastAPI).
3. Core Dashboard UI (Next.js + shadcn/ui).
4. Mapbox Heatmap Integration.
5. Baseline Predictive Modeling.