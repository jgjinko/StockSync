import json
import random
import uuid
from datetime import datetime, timedelta

def generate_sales_history():
    inventory_path = r"c:\Users\User\Documents\AI4Devs Holberton\StockSync\Data\inventory_data.json"
    output_path = r"c:\Users\User\Documents\AI4Devs Holberton\StockSync\Data\sales_history.json"
    
    with open(inventory_path, 'r', encoding='utf-8') as f:
        inventory = json.load(f)
        
    sales = []
    now = datetime.now()
    
    channels = ["Shopify", "Amazon", "TikTok Shop", "Physical POS"]
    channel_fees = {
        "Shopify": 0.029,
        "Amazon": 0.15,
        "TikTok Shop": 0.05,
        "Physical POS": 0.01
    }
    
    for _ in range(500):  # Generate 500 records to have excellent density
        item = random.choice(inventory)
        sku = item.get("sku", "UNKNOWN-SKU")
        retail_price = item.get("retail_price", 0)
        unit_cost = item.get("unit_cost", 0)
        
        channel = random.choice(channels)
        fee_pct = channel_fees[channel]
        platform_fee = round(retail_price * fee_pct, 2)
        
        # simulated shipping cost
        shipping_cost = round(random.uniform(2.0, 8.0), 2) if channel != "Physical POS" else 0.0
        
        # Bias the dates heavily towards the last 30 days for better 'This Week' vs 'Last Week' comparisons
        rand_val = random.random()
        if rand_val < 0.2:
            # last 7 days (this week)
            days_ago = random.uniform(0, 7)
        elif rand_val < 0.4:
            # previous 7 days (last week)
            days_ago = random.uniform(7, 14)
        elif rand_val < 0.7:
            # last 30 days
            days_ago = random.uniform(14, 30)
        else:
            # older
            days_ago = random.uniform(30, 365)
            
        sale_date = now - timedelta(days=days_ago)
        
        sales.append({
            "transaction_id": str(uuid.uuid4()),
            "sku": sku,
            "channel": channel,
            "gross_revenue": retail_price,
            "unit_cost": unit_cost,
            "platform_fee": platform_fee,
            "shipping_cost": shipping_cost,
            "timestamp": sale_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        })
        
    # Sort by timestamp descending
    sales.sort(key=lambda x: x["timestamp"], reverse=True)
        
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sales, f, indent=2)
        
    print(f"Generated {len(sales)} sales records to {output_path}")

if __name__ == "__main__":
    generate_sales_history()
