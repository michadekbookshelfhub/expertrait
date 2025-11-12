import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_test_users():
    print("🌱 Seeding test users...")
    
    # Check if users already exist
    existing_customer = await db.users.find_one({"email": "customer@test.com"})
    existing_professional = await db.users.find_one({"email": "professional@test.com"})
    existing_admin = await db.users.find_one({"email": "admin@test.com"})
    
    users_created = 0
    
    # Customer account
    if not existing_customer:
        customer = {
            "name": "Test Customer",
            "email": "customer@test.com",
            "password": hash_password("password123"),
            "phone": "+1234567890",
            "address": "123 Test Street, San Francisco, CA",
            "user_type": "customer",
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(customer)
        print("✅ Created customer account: customer@test.com / password123")
        users_created += 1
    else:
        print("ℹ️  Customer account already exists")
    
    # Professional account
    if not existing_professional:
        professional = {
            "name": "Test Professional",
            "email": "professional@test.com",
            "password": hash_password("password123"),
            "phone": "+1987654321",
            "user_type": "professional",
            "skills": ["Plumbing", "Electrical", "Handyman"],
            "bio": "Experienced professional with 10+ years in home services",
            "rating": 4.8,
            "total_jobs": 156,
            "available": True,
            "location": None,
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(professional)
        print("✅ Created professional account: professional@test.com / password123")
        users_created += 1
    else:
        print("ℹ️  Professional account already exists")
    
    # Admin account
    if not existing_admin:
        admin = {
            "name": "Admin User",
            "email": "admin@test.com",
            "password": hash_password("password123"),
            "phone": "+1555555555",
            "user_type": "admin",
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(admin)
        print("✅ Created admin account: admin@test.com / password123")
        users_created += 1
    else:
        print("ℹ️  Admin account already exists")
    
    print(f"\n🎉 Done! Created {users_created} new test accounts")
    print("\n📋 Test Accounts Summary:")
    print("=" * 50)
    print("Customer: customer@test.com / password123")
    print("Professional: professional@test.com / password123")
    print("Admin: admin@test.com / password123")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(seed_test_users())
    client.close()
