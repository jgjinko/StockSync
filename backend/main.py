from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from preprocessing import load_and_process  # Corrected function name

app = FastAPI(title="StockSync BI API")

# Allow Next.js to communicate with Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Simplified for initial testing
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data at startup using the pipeline logic
# The pipeline handles its own file paths internally
inventory_data = load_and_process() 

@app.get("/api/inventory")
async def get_all_inventory(channel: Optional[str] = None):
    """Returns unified inventory for Shadcn Data Tables."""
    if channel:
        return [item for item in inventory_data if item['channel'] == channel]
    return inventory_data

@app.get("/api/inventory/{sku}")
async def get_item(sku: str):
    """Returns specific SKU details for the detail view."""
    item = next((i for i in inventory_data if i['sku'] == sku), None)
    if not item:
        raise HTTPException(status_code=404, detail="SKU not found")
    return item

@app.get("/api/analytics/heatmap")
async def get_heatmap():
    """Geographic density data for Mapbox components."""
    return [
        {"lat": i["lat"], "lng": i["lng"], "weight": i["velocity"]}
        for i in inventory_data if i.get("lat")
    ]