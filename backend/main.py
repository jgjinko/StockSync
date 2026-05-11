from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
import random
import time
from pydantic import BaseModel
from preprocessing import load_and_process, persist, load_sales_history, persist_sales_history
import uuid

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
sales_history = load_sales_history()

class PurchaseRequest(BaseModel):
    sku: str
    quantity: int = 1

class InventoryCreateRequest(BaseModel):
    sku: str
    product_title: str
    category: str
    unit_cost: float
    retail_price: float
    initial_stock: int


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

@app.get("/api/analytics/sales-heatmap")
async def get_sales_heatmap():
    """Returns a GeoJSON FeatureCollection of sales density for the Regional Heatmap."""
    # 1. Build coordinate lookup for active SKUs
    sku_coords = {
        item["sku"]: {
            "lat": item["lat"], 
            "lng": item["lng"], 
            "name": item.get("name", "Unknown Product"),
            "price": item.get("retail_price", 0),
            "stock": item.get("available", 0)
        } 
        for item in inventory_data if item.get("lat")
    }
    
    # 2. Aggregate sales revenue by location
    # Note: Use a string key for the dict since tuples are not JSON serializable as keys
    location_totals = {} 

    for tx in sales_history:
        sku = tx.get("sku")
        if sku in sku_coords:
            coord_data = sku_coords[sku]
            
            # Apply outlier filtering as per requirements (price or stock > 50,000)
            if coord_data["price"] > 50000 or coord_data["stock"] > 50000:
                continue
                
            loc_key = f"{coord_data['lat']},{coord_data['lng']}"
            
            if loc_key not in location_totals:
                location_totals[loc_key] = {
                    "revenue": 0.0,
                    "lat": coord_data["lat"],
                    "lng": coord_data["lng"],
                    "product_title": coord_data["name"] # Using first encountered title for simplicity
                }
            
            location_totals[loc_key]["revenue"] += tx.get("gross_revenue", 0.0)

    # 3. Format as GeoJSON FeatureCollection
    features = []
    for loc in location_totals.values():
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [loc["lng"], loc["lat"]]
            },
            "properties": {
                "revenue": round(loc["revenue"], 2),
                "productTitle": loc["product_title"]
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@app.get("/api/finance/ticker")
async def get_finance_ticker(limit: int = 20):
    """Returns the most recent real transactions from sales_history for the Live Ticker."""
    if not sales_history:
        return []

    # Build a lookup map: sku -> name for enriching ticker rows
    sku_name_map = {i.get("sku", ""): i.get("name", i.get("sku", "Unknown")) for i in inventory_data}

    events = []
    for tx in sales_history[:limit]:
        sku = tx.get("transaction_id", "") or tx.get("sku", "")
        product_name = tx.get("product_name") or sku_name_map.get(tx.get("sku", ""), tx.get("sku", "Unknown"))
        # Parse ISO timestamp to unix epoch
        try:
            ts = int(datetime.fromisoformat(tx["timestamp"].replace("Z", "+00:00")).timestamp())
        except Exception:
            ts = int(time.time())

        events.append({
            "id": tx.get("transaction_id", f"tx_{len(events)}"),
            "sku": tx.get("sku", "UNKNOWN"),
            "product_name": product_name,
            "channel": tx.get("channel", "Unknown"),
            "quantity": tx.get("quantity", 1),
            "gross_value": tx.get("gross_revenue", 0.0),
            "timestamp": ts,
        })
    return events

@app.get("/api/finance/trends")
async def get_finance_trends(timeframe: str = "7d"):
    """Returns simulated time-series buckets for revenue and profit."""
    if not inventory_data:
        return []
        
    total_velocity_7d = sum(i.get("velocity", 0) for i in inventory_data)
    daily_base_sales = total_velocity_7d / 7.0 if total_velocity_7d else 100
    avg_price = sum(i.get("retail_price", 0) for i in inventory_data) / max(len(inventory_data), 1)
    
    buckets = []
    
    if timeframe == "24h":
        points = 24
        base_val = (daily_base_sales * avg_price) / 24
    elif timeframe == "30d":
        points = 30
        base_val = daily_base_sales * avg_price
    elif timeframe == "ytd":
        points = 12
        base_val = daily_base_sales * avg_price * 30
    else: # 7d
        points = 7
        base_val = daily_base_sales * avg_price

    now = datetime.now()
    
    for i in range(points):
        if timeframe == "24h":
            dt = now - timedelta(hours=points - 1 - i)
            label = dt.strftime("%H:00")
        elif timeframe == "ytd":
            dt = now - timedelta(days=30 * (points - 1 - i))
            label = dt.strftime("%b")
        else:
            dt = now - timedelta(days=points - 1 - i)
            label = dt.strftime("%a" if timeframe == "7d" else "%m/%d")
            
        noise = random.uniform(0.7, 1.3)
        gross = base_val * noise
        net = gross * random.uniform(0.3, 0.4)
        
        buckets.append({
            "label": label,
            "gross": round(gross, 2),
            "net": round(net, 2)
        })
        
    return buckets

@app.get("/api/finance/matrix")
async def get_finance_matrix():
    """Returns Cross-Channel Performance Matrix metrics."""
    if not inventory_data:
        return []
    
    # Standardize fee rates per platform assumptions
    fee_rates = {
        "Shopify": 0.02, # 2%
        "Amazon": 0.15,  # 15%
        "TikTok": 0.05   # 5%
    }
    
    # Default to 0.05 for unknown channels
    def get_fee(channel):
        for k, v in fee_rates.items():
            if k.lower() in channel.lower():
                return v
        return 0.05
        
    metrics = {}
    
    for item in inventory_data:
        channel = item.get("channel", "Unknown")
        if channel not in metrics:
            metrics[channel] = {
                "channel": channel,
                "gross_revenue": 0,
                "platform_fees": 0,
                "unit_costs": 0,
                "shipping": 0,
                "transactions": 0
            }
            
        vel = item.get("velocity", 0)
        if vel <= 0:
            vel = random.randint(1, 10)  # assume some minimal velocity
            
        price = item.get("retail_price", 0)
        cogs = item.get("unit_cost", 0)
        
        gross = vel * price
        fee = gross * get_fee(channel)
        cost = vel * cogs
        shipping = vel * random.uniform(1.5, 4.0) # Random shipping cost mapping
        
        metrics[channel]["gross_revenue"] += gross
        metrics[channel]["platform_fees"] += fee
        metrics[channel]["unit_costs"] += cost
        metrics[channel]["shipping"] += shipping
        metrics[channel]["transactions"] += vel
        
    results = []
    for c, m in metrics.items():
        if m["gross_revenue"] == 0:
            continue
            
        net_profit = m["gross_revenue"] - (m["platform_fees"] + m["unit_costs"] + m["shipping"])
        roi = (net_profit / (m["unit_costs"] + m["platform_fees"] + m["shipping"])) * 100 if m["unit_costs"] > 0 else 0
        
        m["net_profit"] = net_profit
        m["roi"] = roi
        results.append(m)
        
    return sorted(results, key=lambda x: x["gross_revenue"], reverse=True)

@app.get("/api/finance/kpi")
async def get_finance_kpi():
    """Returns advanced BI widgets metrics."""
    if not inventory_data:
        return {
            "net_margin": 0,
            "aov": 0,
            "dead_stock_value": 0
        }
        
    import hashlib
    
    total_gross_sales = 0
    total_cogs = 0
    total_fees = 0
    total_shipping = 0
    total_orders = 0
    dead_stock_value = 0
    
    # Standardize fee rates per platform assumptions
    fee_rates = {
        "Shopify": 0.02, # 2%
        "Amazon": 0.15,  # 15%
        "TikTok": 0.05   # 5%
    }
    
    def get_fee(channel):
        for k, v in fee_rates.items():
            if k.lower() in channel.lower():
                return v
        return 0.05
        
    for item in inventory_data:
        vel = item.get("velocity", 0)
        price = item.get("retail_price", 0)
        cogs = item.get("unit_cost", 0)
        channel = item.get("channel", "Unknown")
        stock = item.get("inventory_count", 0)
        
        # Dead Stock Value calculation (velocity == 0 threshold)
        if vel == 0 and stock > 0:
            dead_stock_value += (cogs * stock)
            
        if vel > 0:
            gross = vel * price
            fee = gross * get_fee(channel)
            cost = vel * cogs
            
            sku_hash = int(hashlib.md5(item.get("sku", "Unknown").encode()).hexdigest(), 16)
            # deterministic random between 1.5 and 4.0
            shipping = vel * (1.5 + (sku_hash % 250) / 100.0)
            
            total_gross_sales += gross
            total_cogs += cost
            total_fees += fee
            total_shipping += shipping
            total_orders += vel
            
    net_margin = total_gross_sales - (total_cogs + total_fees + total_shipping)
    aov = (total_gross_sales / total_orders) if total_orders > 0 else 0
    
    return {
        "net_margin": round(net_margin, 2),
        "aov": round(aov, 2),
        "dead_stock_value": round(dead_stock_value, 2)
    }

@app.post("/api/simulate-purchase")
async def simulate_purchase(req: PurchaseRequest):
    """Simulates a purchase from the Demo Store."""
    if req.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    item = next((i for i in inventory_data if i['sku'] == req.sku), None)
    if not item:
        raise HTTPException(status_code=404, detail="SKU not found")
        
    if item.get("available", 0) < req.quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Available: {item.get('available', 0)}")
        
    # Update stock levels: Commit available stock to reserved status
    item["available"] = max(0, item.get("available", 0) - req.quantity)
    item["reserved"] = item.get("reserved", 0) + req.quantity
    # on_hand remains unchanged as the stock is still physically present until fulfillment
    
    # Calculate financials for the sale
    retail_price = item.get("retail_price", 0.0)
    unit_cost = item.get("unit_cost", 0.0)
    
    channel = "Demo Store"
    fee_pct = 0.029 # Simulating a standard web checkout fee (e.g. 2.9%)
    platform_fee = round((retail_price * req.quantity) * fee_pct, 2)
    shipping_cost = round(random.uniform(2.0, 8.0) * req.quantity, 2) if item.get("requires_shipping", True) else 0.0
    
    product_name = item.get("name", req.sku)

    transaction = {
        "transaction_id": str(uuid.uuid4()),
        "sku": req.sku,
        "product_name": product_name,
        "channel": channel,
        "quantity": req.quantity,
        "gross_revenue": round(retail_price * req.quantity, 2),
        "unit_cost": round(unit_cost * req.quantity, 2),
        "platform_fee": platform_fee,
        "shipping_cost": shipping_cost,
        "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    
    # Prepend to keep latest first, or just append and sort. sales_history might be sorted descending.
    sales_history.insert(0, transaction)
    
    # Persist both back to disk
    persist(inventory_data)
    persist_sales_history(sales_history)
    
    return {
        "message": "Purchase successful",
        "transaction": transaction,
        "new_stock_available": item["available"]
    }

@app.post("/api/inventory")
async def create_sku(req: InventoryCreateRequest):
    """Adds a new SKU to the canonical inventory dataset."""
    if any(item['sku'] == req.sku for item in inventory_data):
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    new_item = {
        "sku": req.sku,
        "name": req.product_title,
        "category": req.category,
        "unit_cost": abs(req.unit_cost),
        "retail_price": abs(req.retail_price),
        "safety_stock": 0,  # Default
        "lead_time": 0,     # Default
        "available": abs(req.initial_stock),
        "reserved": 0,
        "on_hand": abs(req.initial_stock),
        "channel": "Manual Entry",
        "is_active": True,
        "is_discontinued": False,
        "requires_shipping": True,
        "velocity": 0.0,
        "fulfillment_service": "In-house",
        "status": "out_of_stock"
    }
    
    inventory_data.append(new_item)
    persist(inventory_data)
    return new_item

@app.delete("/api/inventory/{sku}")
async def delete_sku(sku: str):
    """Removes a SKU from the dataset."""
    global inventory_data
    item_index = next((index for (index, d) in enumerate(inventory_data) if d["sku"] == sku), None)
    
    if item_index is None:
        raise HTTPException(status_code=404, detail="SKU not found")
        
    inventory_data.pop(item_index)
    persist(inventory_data)
    return {"message": "SKU deleted successfully"}

@app.patch("/api/inventory/{sku}/toggle")
async def toggle_sku_active(sku: str):
    """Toggles the is_active flag for a specific SKU."""
    item = next((i for i in inventory_data if i['sku'] == sku), None)
    if not item:
        raise HTTPException(status_code=404, detail="SKU not found")
        
    item["is_active"] = not item.get("is_active", True)
    persist(inventory_data)
    return item