# Data Preprocessing — StockSync

## Preprocessing Pipeline
Apply these steps at application startup within `backend/preprocessing.py`.

### Step 1 — Load and Parse
- Verify valid JSON structure from `inventory_data.json`.

### Step 2 — SKU Verification
- Ensure every record has a valid `sku`. Generate an internal ID for records missing a SKU.

### Step 3 — Sign Correction
- Some systems record returns or adjustments as negative inventory incorrectly.
- **Rule:** Convert all negative inventory and price values to positive using `abs()`.

### Step 4 — Null Handling
- **Booleans:** Default to `false`.
- **Categories:** Default to `"unknown"`.
- **Inventory:** Default to `0`.

### Step 5 — Outlier Removal
- Exclude records from the ML dataset where price or stock exceeds physical scalability limits (e.g., > 50,000 units).

### Step 6 — Unified Field Mapping
- Standardize platform-specific keys (e.g., `inventory_levels_available` -> `stock`).
- Map keys to camelCase for the shadcn/ui frontend.

### Step 7 — Intelligence Tagging
- Calculate a `status` field (`in_stock`, `low_stock`, `out_of_stock`) for UI badges.