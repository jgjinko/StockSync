"""
preprocessing.py — StockSync Data Pipeline
Implements the 7-step data reconciliation pipeline defined in:
  Docs/concept/04-data-preprocessing.md

Run at application startup. Produces a clean, canonical list of
inventory records ready for the FastAPI layer.
"""

import json
import uuid
from pathlib import Path
from typing import Any

# ── Paths ──────────────────────────────────────────────────────────────────────
DATA_FILE = Path(__file__).parent.parent / "Data" / "inventory_data.json"

# ── Field Mapping — verbose raw keys → canonical snake_case ───────────────────
# Source: Docs/concept/04-data-preprocessing.md, Step 6
FIELD_MAP: dict[str, str] = {
    # Identification
    "sku_code":                      "sku",
    "product_title":                 "name",
    "product_category":              "category",
    # Stock levels
    "inventory_levels_available":    "available",
    "inventory_levels_reserved":     "reserved",
    "inventory_levels_on_hand":      "on_hand",
    "safety_stock_threshold":        "safety_stock",
    # Channel
    "sales_channel_origin":          "channel",
    "fulfillment_service":           "fulfillment_service",
    # Financials
    "pricing_unit_cost":             "unit_cost",
    "pricing_retail_price":          "retail_price",
    # Geographic
    "geographic_origin_lat":         "lat",
    "geographic_origin_lng":         "lng",
    # Velocity & lead time
    "velocity_metrics_7d":           "velocity",
    "supplier_lead_time_days":       "lead_time",
    # Flags (pass-through — same key)
    "is_active":                     "is_active",
    "is_discontinued":               "is_discontinued",
    "requires_shipping":             "requires_shipping",
}

# Fields that represent numeric inventory/price and must pass through abs()
_INVENTORY_FIELDS = ("available", "reserved", "on_hand")
_PRICE_FIELDS     = ("unit_cost", "retail_price")
_INT_FIELDS       = ("available", "reserved", "on_hand", "safety_stock", "lead_time")


# ── Step 7 helper ──────────────────────────────────────────────────────────────
def _compute_status(record: dict[str, Any]) -> str:
    """Calculate the status badge value based on stock vs. safety threshold."""
    available    = record.get("available", 0)
    safety_stock = record.get("safety_stock", 0)
    if available == 0:
        return "out_of_stock"
    if available <= safety_stock:
        return "low_stock"
    return "in_stock"


# ── Core pipeline ──────────────────────────────────────────────────────────────
def run_pipeline(raw_data: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Apply all 7 preprocessing steps to a list of raw inventory records.
    Handles both verbose raw format (from inventory_data.json)
    and canonical format (records already processed and saved back by the API).
    """
    processed: list[dict[str, Any]] = []

    for raw in raw_data:
        record: dict[str, Any] = {}

        # ── Step 1: Load & Parse — already done by caller ─────────────────────

        # ── Step 6: Unified Field Mapping ──────────────────────────────────────
        # Pass 1: map verbose keys to canonical names
        for raw_key, canonical_key in FIELD_MAP.items():
            if raw_key in raw:
                record[canonical_key] = raw[raw_key]

        # Pass 2: carry over any canonical keys that are already present
        # (covers records written back to JSON by the API in canonical format)
        for canonical_key in FIELD_MAP.values():
            if canonical_key not in record and canonical_key in raw:
                record[canonical_key] = raw[canonical_key]

        # ── Step 2: SKU Verification ───────────────────────────────────────────
        if not record.get("sku"):
            record["sku"] = f"AUTO-{str(uuid.uuid4())[:8].upper()}"

        # ── Step 3: Sign Correction — abs() on negative inventory & prices ─────
        for field in _INVENTORY_FIELDS + _PRICE_FIELDS:
            if field in record and record[field] is not None:
                record[field] = abs(float(record[field]))

        # Validation: available units cannot exceed physical on-hand stock
        available = record.get("available", 0)
        on_hand   = record.get("on_hand", 0)
        if available > on_hand:
            record["available"] = on_hand

        # Ensure integer type for stock/lead fields
        for field in _INT_FIELDS:
            if field in record and record[field] is not None:
                record[field] = int(record[field])

        # ── Step 4: Null Handling ──────────────────────────────────────────────
        record.setdefault("is_active",        False)
        record.setdefault("is_discontinued",  False)
        record.setdefault("requires_shipping", False)
        record.setdefault("category",         "unknown")
        record.setdefault("available",        0)
        record.setdefault("reserved",         0)
        record.setdefault("on_hand",          0)
        record.setdefault("safety_stock",     0)
        record.setdefault("lead_time",        0)
        record.setdefault("velocity",         0.0)
        record.setdefault("lat",              0.0)
        record.setdefault("lng",              0.0)
        record.setdefault("fulfillment_service", "unknown")

        # ── Step 5: Outlier Removal ────────────────────────────────────────────
        # Records exceeding physical scalability limits are excluded from
        # analytics but included in the API as-is (MVP behaviour).
        # Future: add a flag like `is_outlier: true` for ML exclusion.

        # ── Step 7: Intelligence Tagging ───────────────────────────────────────
        record["status"] = _compute_status(record)

        processed.append(record)

    return processed


# ── Public Interface ───────────────────────────────────────────────────────────
def load_and_process() -> list[dict[str, Any]]:
    """Load raw JSON from disk and run the full preprocessing pipeline."""
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
    return run_pipeline(raw_data)


def persist(data: list[dict[str, Any]]) -> None:
    """
    Persist the canonical (processed) inventory list back to disk.
    The pipeline's Pass 2 (canonical key handling) ensures subsequent
    startups load this format correctly without requiring verbose keys.
    """
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
