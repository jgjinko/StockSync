# Demo Store Population Plan

Transform the existing `/demo-store` shell into a fully functional consumer simulation marketplace that drives real Finance Hub data.

## Context & Key Findings

The current `DemoStore.tsx` attempts to **fetch inventory from the backend API** — but the page appears empty if the backend is not running. A cleaner, more resilient approach is to **use the `inventory` array directly from `src/data/inventory.ts`** (which preprocesses `inventory_data.json` client-side, mirrors the backend pipeline, and is always available). Purchase actions are still sent to the backend for Finance Hub data generation.

### Important Field Differences

The existing `DemoStore.tsx` uses old snake_case backend fields (`retail_price`, `name`). The `inventory.ts` exports use camelCase (`retailPrice`, `productTitle`). The rewrite will align everything to `inventory.ts`.

| `inventory.ts` field | Used for             |
|----------------------|----------------------|
| `sku`                | Backend POST payload |
| `productTitle`       | Card title           |
| `productCategory`    | Card category badge  |
| `retailPrice`        | Price display        |
| `available`          | Live stock count     |
| `status`             | Badge color logic    |
| `requiresShipping`   | Shipping cost sim    |

---

## Proposed Changes

### Task 1: The UI Connection

**Goal:** Replace the current fetch-based shell with a statically seeded, always-visible grid populated from `inventory.ts`.

#### [MODIFY] `StockSync/StockSync/src/pages/DemoStore.tsx`

- **Data Source:** Import `inventory` and `InventoryItem` from `../data/inventory.ts`.
- **Local State:** Initialize `useState` with the `inventory` array so the page renders instantly with no loading state. Maintain a local copy of the items so individual card quantities/availability can be updated optimistically.
- **Product Grid:** Responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` using shadcn `Card`.
- **Card Layout (per product):**
  - `AspectRatio` container (1:1) acting as a product image placeholder, with the category displayed as a centered watermark text.
  - `CardHeader`: `productTitle` + SKU mono text.
  - `CardContent`:
    - Formatted `retailPrice` (e.g., `$149.99 USD`).
    - Quantity stepper (+/- buttons) capped between 1 and `available`.
    - Stock badge using `status` (`inStock` → green, `lowStock` → amber, `outOfStock` → red).
    - Available unit count.
  - `CardFooter`: "Buy Now" button — disabled when `status === "outOfStock"` or purchase is in flight.
- **Filtering:** Add a category filter bar at the top using `Badge` buttons to narrow the grid.
- **Sorting:** A simple dropdown to sort by Price (asc/desc) or Stock (asc/desc).

---

### Task 2: The Action Logic

**Goal:** Connect "Buy Now" to the backend simulation endpoint and implement optimistic UI updates.

#### [MODIFY] `StockSync/StockSync/src/pages/DemoStore.tsx` (continued)

- **`handleBuy(sku, quantity)` function:**
  1. Mark the card as `buying` (shows spinner on the button).
  2. **Optimistic update:** Immediately decrement `available` in local state and recompute `status` so the badge updates instantly without waiting for the server.
  3. Send `POST http://localhost:8000/api/simulate-purchase` with `{ sku, quantity }`.
  4. **On success:** Fire a success Toast — `"Order Placed! ${qty} unit(s) of ${productTitle} confirmed."`.
  5. **On error:** **Rollback** the optimistic update (restore previous `available` count) and fire an error Toast — `"Sync Error: Could not process purchase. Check if the backend is running."`.

> The badge color updates instantly because status is recomputed from the new available count client-side — same logic as inventory.ts — no extra API call needed.

---

## Verification Plan

1. Open `/demo-store` — the product grid must render **immediately** (no spinner, no empty state) because it seeds from the local `inventory.ts` array.
2. Use the **category filter** to narrow results and confirm the grid re-renders correctly.
3. Click "Buy Now" on an in-stock item:
   - The button shows a loading spinner.
   - The available count decrements on the card instantly (optimistic update).
   - A green success Toast appears.
   - The Finance Hub's `/finance` page reflects the new transaction on its next polling cycle.
4. Set quantity to more than available → the `+` button is disabled.
5. Exhaust stock on an item → badge flips to red "Out of Stock" and the button disables.
6. **Rollback test:** Stop the backend and attempt a purchase → the count reverts, and a red error Toast appears.
