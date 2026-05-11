import rawData from "./inventory_data.json";

export interface InventoryItem {
  sku: string;
  productTitle: string;
  productCategory: string;
  available: number;
  reserved: number;
  onHand: number;
  safetyThreshold: number;
  salesChannel: string;
  fulfillmentService: string;
  unitCost: number;
  retailPrice: number;
  isActive: boolean;
  isDiscontinued: boolean;
  requiresShipping: boolean;
  lat: number;
  lng: number;
  velocity7d: number;
  supplierLeadTimeDays: number;
  status: "inStock" | "lowStock" | "outOfStock";
  daysOfCover: number | null;
  inventoryValue: number;
  potentialRevenue: number;
}

// --- Preprocessing Pipeline (mirrors backend/preprocessing.py) ---

// The backend persists inventory in canonical (short) key format after purchases.
// This helper resolves a value from either the original verbose key or the
// canonical key written by the backend, so the pipeline survives both formats.
function pick<T>(raw: Record<string, any>, verboseKey: string, canonicalKey: string, fallback: T): T {
  if (raw[verboseKey] !== undefined && raw[verboseKey] !== null) return raw[verboseKey] as T;
  if (raw[canonicalKey] !== undefined && raw[canonicalKey] !== null) return raw[canonicalKey] as T;
  return fallback;
}

function preprocessItem(raw: Record<string, any>): InventoryItem {
  // Step 2: SKU verification
  const sku = pick<string>(raw, "sku_code", "sku", "") || `AUTO-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  // Step 3: Sign correction — abs() on numeric values
  const available          = Math.abs(pick<number>(raw, "inventory_levels_available", "available", 0));
  const reserved           = Math.abs(pick<number>(raw, "inventory_levels_reserved",  "reserved",  0));
  const onHand             = Math.abs(pick<number>(raw, "inventory_levels_on_hand",   "on_hand",   0));
  const safetyThreshold    = Math.abs(pick<number>(raw, "safety_stock_threshold",     "safety_stock", 0));
  const unitCost           = Math.abs(pick<number>(raw, "pricing_unit_cost",          "unit_cost",   0));
  const retailPrice        = Math.abs(pick<number>(raw, "pricing_retail_price",       "retail_price", 0));
  const velocity7d         = Math.abs(pick<number>(raw, "velocity_metrics_7d",        "velocity",    0));
  const supplierLeadTimeDays = Math.abs(pick<number>(raw, "supplier_lead_time_days",  "lead_time",   0));

  // Step 4: Null handling — prefer verbose keys, fall back to canonical
  const isActive          = pick<boolean>(raw, "is_active",          "is_active",          false);
  const isDiscontinued    = pick<boolean>(raw, "is_discontinued",     "is_discontinued",    false);
  const requiresShipping  = pick<boolean>(raw, "requires_shipping",   "requires_shipping",  false);
  const productCategory   = pick<string>(raw,  "product_category",   "category",           "unknown");
  const salesChannel      = pick<string>(raw,  "sales_channel_origin", "channel",          "unknown");
  const fulfillmentService = pick<string>(raw, "fulfillment_service", "fulfillment_service", "unknown");
  const productTitle      = pick<string>(raw,  "product_title",      "name",               "Untitled Product");
  const lat               = pick<number>(raw,  "geographic_origin_lat", "lat",             0);
  const lng               = pick<number>(raw,  "geographic_origin_lng", "lng",             0);

  // Step 7: Intelligence tagging
  let status: InventoryItem["status"];
  if (available === 0) {
    status = "outOfStock";
  } else if (available <= safetyThreshold) {
    status = "lowStock";
  } else {
    status = "inStock";
  }

  // Days of Cover calculation
  const daysOfCover = velocity7d > 0 ? Math.round(available / velocity7d) : null;

  // Computed financial metrics
  const inventoryValue = onHand * unitCost;
  const potentialRevenue = onHand * retailPrice;

  return {
    sku,
    productTitle,
    productCategory,
    available,
    reserved,
    onHand,
    safetyThreshold,
    salesChannel,
    fulfillmentService,
    unitCost,
    retailPrice,
    isActive,
    isDiscontinued,
    requiresShipping,
    lat,
    lng,
    velocity7d,
    supplierLeadTimeDays,
    status,
    daysOfCover,
    inventoryValue,
    potentialRevenue,
  };
}


// Step 5: Outlier removal (price or stock > 50,000)
function isWithinLimits(item: InventoryItem): boolean {
  return item.onHand <= 50000 && item.retailPrice <= 50000;
}

// Process and export
export const inventory: InventoryItem[] = rawData
  .map(preprocessItem)
  .filter(isWithinLimits);

// --- Derived Analytics ---

export const totalSKUs = inventory.length;
export const activeSKUs = inventory.filter((i) => i.isActive).length;

export const inStockCount = inventory.filter((i) => i.status === "inStock").length;
export const lowStockCount = inventory.filter((i) => i.status === "lowStock").length;
export const outOfStockCount = inventory.filter((i) => i.status === "outOfStock").length;

export const totalInventoryValue = Math.round(
  inventory.reduce((sum, i) => sum + i.inventoryValue, 0)
);
export const totalPotentialRevenue = Math.round(
  inventory.reduce((sum, i) => sum + i.potentialRevenue, 0)
);

// Channel distribution
export const channelDistribution = Object.entries(
  inventory.reduce(
    (acc, item) => {
      acc[item.salesChannel] = (acc[item.salesChannel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  )
).map(([channel, count]) => ({ type: channel, value: count }));

// Category distribution with stock breakdown
export const categoryStockBreakdown = Object.entries(
  inventory.reduce(
    (acc, item) => {
      if (!acc[item.productCategory]) {
        acc[item.productCategory] = { available: 0, reserved: 0 };
      }
      acc[item.productCategory].available += item.available;
      acc[item.productCategory].reserved += item.reserved;
      return acc;
    },
    {} as Record<string, { available: number; reserved: number }>
  )
).map(([category, data]) => ({
  category,
  available: data.available,
  reserved: data.reserved,
}));

// Category value distribution
export const categoryValueDistribution = Object.entries(
  inventory.reduce(
    (acc, item) => {
      acc[item.productCategory] = (acc[item.productCategory] || 0) + Math.round(item.potentialRevenue);
      return acc;
    },
    {} as Record<string, number>
  )
).map(([name, value]) => ({ name, value }));

// Stock health percentages
export const stockHealthPercentages = {
  inStock: totalSKUs > 0 ? inStockCount / totalSKUs : 0,
  lowStock: totalSKUs > 0 ? lowStockCount / totalSKUs : 0,
  outOfStock: totalSKUs > 0 ? outOfStockCount / totalSKUs : 0,
};
