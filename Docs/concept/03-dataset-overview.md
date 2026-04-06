# Dataset Overview — Multi-Channel Inventory

## Purpose
This document explains the data structure used to fuel the StockSync intelligence engine.

## Dataset File
`data/inventory_data.json`
Contains raw exports from Shopify, Amazon SP-API, and TikTok Shop.

## Prediction Target
The primary target for predictive analytics is:
- **Sales Velocity (7-day):** Used to calculate reorder points and "Days of Cover."

## Main Field Groups
1. **Identification:** `sku_code`, `product_title`.
2. **Stock Levels:** `available`, `reserved`, `on_hand`, `safety_threshold`.
3. **Financials:** `unit_cost`, `retail_price`.
4. **Geographic:** `lat`, `lng` (based on shipping destination density).
5. **Platform:** `sales_channel_origin`.

## Strategy for AI Agents
- **SKU Stability:** Always use the `sku` as the primary key for state management.
- **Negative Fixing:** Treat negative stock values as entry errors; apply `abs()`.
- **CamelCase Conversion:** The backend must convert raw snake_case keys to camelCase for Next.js compatibility.