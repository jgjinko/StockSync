# StockSync Sandbox Build Plan

This plan breaks down the development of the "Demo Store" simulation engine into two clear tasks, ensuring strict adherence to the project's headless architecture, Next.js/Vite frontend requirements, and local-first data integrity constraints.

> [!IMPORTANT]  
> **Frontend Project Location:** We will implement the frontend in `StockSync/StockSync` (your active Vite-based React project) as per your latest preference, instead of a separate Next.js `frontend/` directory.

## Open Questions

1. **Persistent Data Location:** Currently, the `backend/preprocessing.py` script looks for `inventory_data.json` at `../Data/inventory_data.json`, but we just moved `sales_history.json` into `StockSync/StockSync/src/data/`. Do you want me to update the backend to read/write both JSON datasets exclusively from `StockSync/StockSync/src/data/` so everything is unified?
2. **Transaction Details:** For simulated purchases, should we randomly select the channel (e.g., Shopify, Amazon) for the transaction, or default to a specific "Demo Store" channel?

---

## Proposed Changes

### Task 1: Simulation Logic (FastAPI Backend)

We will build the endpoint responsible for receiving a purchase signal and synchronously updating both inventory and financial records.

#### [MODIFY] `backend/preprocessing.py`
- Expose a method to read/write the new `sales_history.json`.
- Update `DATA_FILE` paths if we agree to point everything to `StockSync/StockSync/src/data/`.

#### [MODIFY] `backend/main.py`
- **New Endpoint:** `POST /api/simulate-purchase`
- **Logic:** 
  1. Receive `sku` and `quantity` (default 1) in the request body.
  2. Locate the SKU in the in-memory `inventory_data`.
  3. Validate stock: Ensure `available >= quantity`. If not, return a 400 error.
  4. Decrement `inventory_levels_available` (or canonical `available`) by `quantity`. Use `abs()` to ensure it never dips below 0.
  5. Calculate financials (gross revenue, platform fee, shipping) based on the item's pricing **multiplied by the quantity**.
  6. Append a new record to `sales_history.json` with a current ISO timestamp.
  7. Persist changes to both JSON files on disk using helper methods from `preprocessing.py`.

---

### Task 2: The Demo Store UI (Vite / React Frontend)

We will build a consumer-facing marketplace UI to trigger these backend simulations.

#### [NEW] `StockSync/StockSync/src/pages/DemoStore.tsx`
- Build a responsive grid displaying Shadcn `Card` components for each product.
- Each card will display:
  - Product Title & Image placeholder
  - Price (`retail_price`)
  - A dynamic "Live Stock" badge (Green/Amber/Red based on `status`)
  - A quantity input field (to simulate ordering more than 1 item)
  - A "Buy Now" button.
- Implement an API call to `POST http://localhost:8000/api/simulate-purchase`, passing the selected `quantity`.
- Integrate `useEffect` polling to refresh stock levels after a purchase.

#### [MODIFY] `StockSync/StockSync/src/App.tsx`
- Add a new `<Route path="/demo-store" element={<DemoStore />} />`
- Add a link to the Demo Store in the existing `SideNav` component.

#### [MODIFY] `StockSync/StockSync/src/components/ui`
- Run `npx shadcn@latest add toast` to install the Toast notification system for providing user feedback ("Purchase successful!").

---

## Verification Plan

### Automated/Manual Verification
- Navigate to `/demo-store` and observe the product cards and their "Live Stock" badges.
- Select a quantity greater than 1, click "Buy Now" on an item, and ensure:
  1. A toast notification confirms the purchase of multiple items.
  2. The stock badge decrements correctly by the requested quantity.
  3. The `sales_history.json` file on disk has a newly appended transaction where revenue/cost reflects the quantity multiplied.
  4. The Finance Hub `/finance` reflects the new transaction upon its next polling cycle.
