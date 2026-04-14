import { activeSKUs, inStockCount, lowStockCount, outOfStockCount, totalSKUs } from "./inventory";

export const metrics = [
  {
    title: "Total Tracked SKUs",
    value: totalSKUs.toString(),
    change: 0.05,
  },
  {
    title: "In Stock (Healthy)",
    value: inStockCount.toString(),
    change: 0.12,
  },
  {
    title: "Low Stock (Warning)",
    value: lowStockCount.toString(),
    change: -0.02,
  },
  {
    title: "Out of Stock (Critical)",
    value: outOfStockCount.toString(),
    change: -0.08,
  },
];
