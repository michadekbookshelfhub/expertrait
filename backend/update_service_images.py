import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Service images mapping - high quality images from Unsplash/Pexels
service_images = {
    # Cleaning
    "Deep Cleaning": "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=400&q=85",
    "Carpet Cleaning": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=85",
    "Window Cleaning": "https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?w=400&q=85",
    "Move-In/Move-Out Cleaning": "https://images.pexels.com/photos/4239035/pexels-photo-4239035.jpeg?w=400",
    
    # Plumbing
    "Leak Repair": "https://images.unsplash.com/photo-1542013936693-884638332954?w=400&q=85",
    "Drain Cleaning": "https://images.unsplash.com/photo-1620653713380-7a34b773fef8?w=400&q=85",
    "Water Heater Installation": "https://images.unsplash.com/photo-1749532125405-70950966b0e5?w=400&q=85",
    "Pipe Replacement": "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400",
    "Garbage Disposal Installation": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=85",
    
    # Electrical
    "Outlet Installation": "https://images.unsplash.com/photo-1682345262055-8f95f3c513ea?w=400&q=85",
    "Light Fixture Installation": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=85",
    "Circuit Breaker Repair": "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?w=400",
    "Ceiling Fan Installation": "https://images.unsplash.com/photo-1665242043190-0ef29390d289?w=400&q=85",
    "Smart Home Device Setup": "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400&q=85",
    
    # HVAC
    "AC Repair": "https://images.pexels.com/photos/32497161/pexels-photo-32497161.jpeg?w=400",
    "Furnace Maintenance": "https://images.pexels.com/photos/5463581/pexels-photo-5463581.jpeg?w=400",
    "Duct Cleaning": "https://images.pexels.com/photos/5463581/pexels-photo-5463581.jpeg?w=400",
    "Thermostat Installation": "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400&q=85",
    
    # Appliances
    "Refrigerator Repair": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=85",
    "Washer/Dryer Repair": "https://images.unsplash.com/photo-1632923565835-6582b54f2105?w=400&q=85",
    "Dishwasher Repair": "https://images.unsplash.com/photo-1562941995-17dc31eaaf6d?w=400&q=85",
    "Oven Repair": "https://images.pexels.com/photos/213162/pexels-photo-213162.jpeg?w=400",
    
    # Handyman
    "Door Installation": "https://images.unsplash.com/flagged/photo-1564767609213-c75ee685263a?w=400&q=85",
    "Drywall Repair": "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&q=85",
    "Furniture Assembly": "https://images.unsplash.com/reserve/oIpwxeeSPy1cnwYpqJ1w_Dufer%20Collateral%20test.jpg?w=400&q=85",
    "Painting Touch-ups": "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&q=85",
    "Shelf Installation": "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=400",
    
    # Painting
    "Interior Painting": "https://images.unsplash.com/photo-1717281234297-3def5ae3eee1?w=400&q=85",
    "Exterior Painting": "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=400&q=85",
    "Deck Staining": "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&q=85",
    "Cabinet Painting": "https://images.unsplash.com/photo-1676311396794-f14881e9daaa?w=400&q=85",
    
    # Landscaping
    "Lawn Mowing": "https://images.unsplash.com/photo-1458245201577-fc8a130b8829?w=400&q=85",
    "Tree Trimming": "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?w=400&q=85",
    "Garden Design": "https://images.unsplash.com/photo-1597201278257-3687be27d954?w=400&q=85",
    "Seasonal Cleanup": "https://images.pexels.com/photos/209230/pexels-photo-209230.jpeg?w=400",
    
    # Pest Control
    "Termite Treatment": "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?w=400&q=85",
    "Rodent Control": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=85",
    "Bed Bug Treatment": "https://images.unsplash.com/photo-1581578731567-c884e2816aaa?w=400&q=85",
    "General Pest Control": "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?w=400&q=85",
    
    # Locksmith
    "Lock Installation": "https://images.pexels.com/photos/792034/pexels-photo-792034.jpeg?w=400",
    "Key Duplication": "https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?w=400&q=85",
    "Lock Repair": "https://images.unsplash.com/flagged/photo-1564767609213-c75ee685263a?w=400&q=85",
    "Emergency Lockout": "https://images.pexels.com/photos/792034/pexels-photo-792034.jpeg?w=400",
}

async def update_service_images():
    print("🖼️  Updating service images...")
    
    updated = 0
    not_found = []
    
    for service_name, image_url in service_images.items():
        result = await db.services.update_one(
            {"name": service_name},
            {"$set": {"image_url": image_url}}
        )
        
        if result.matched_count > 0:
            updated += 1
            print(f"✅ Updated: {service_name}")
        else:
            not_found.append(service_name)
            print(f"⚠️  Not found: {service_name}")
    
    print(f"\n📊 Summary:")
    print(f"   - Updated: {updated} services")
    print(f"   - Not found: {len(not_found)} services")
    
    if not_found:
        print(f"\n❌ Services not found in database:")
        for name in not_found:
            print(f"   - {name}")

if __name__ == "__main__":
    asyncio.run(update_service_images())
    client.close()
