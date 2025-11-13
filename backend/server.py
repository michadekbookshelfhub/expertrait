from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Request, Header
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
import bcrypt
import json
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Environment variables
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

# Create the main app
app = FastAPI(title="Oscar Home Services API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected for user: {user_id}")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            logger.info(f"WebSocket disconnected for user: {user_id}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message: {e}")

manager = ConnectionManager()

# ==================== Models ====================

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class LocationModel(BaseModel):
    latitude: float
    longitude: float

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    address: Optional[str] = None
    user_type: str = "customer"  # "customer" or "professional"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    user_type: str
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfessionalCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    skills: List[str]
    bio: Optional[str] = None

class ProfessionalResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    skills: List[str]
    bio: Optional[str] = None
    rating: float = 5.0
    total_jobs: int = 0
    available: bool = True
    location: Optional[LocationModel] = None
    created_at: datetime

class ServiceCreate(BaseModel):
    category: str
    name: str
    description: str
    fixed_price: float
    estimated_duration: int  # in minutes
    image_base64: Optional[str] = None

class ServiceResponse(BaseModel):
    id: str
    category: str
    name: str
    description: str
    fixed_price: float
    estimated_duration: int
    image_base64: Optional[str] = None
    created_at: datetime

class BookingCreate(BaseModel):
    service_id: str
    customer_id: str
    scheduled_time: datetime
    location: LocationModel
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    service_id: str
    customer_id: str
    professional_id: Optional[str] = None
    service_name: str
    service_price: float
    status: str  # pending, accepted, in_progress, completed, cancelled
    scheduled_time: datetime
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    location: LocationModel
    notes: Optional[str] = None
    payment_status: str = "pending"
    created_at: datetime

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    professional_id: Optional[str] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None

class ReviewCreate(BaseModel):
    booking_id: str
    customer_id: str
    professional_id: str
    rating: int  # 1-5
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    customer_id: str
    customer_name: str
    professional_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

class LocationUpdate(BaseModel):
    professional_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class PaymentRequest(BaseModel):
    booking_id: str
    origin_url: str

# ==================== Utility Functions ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def serialize_doc(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# ==================== Auth Routes ====================

@api_router.post("/auth/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    """Register a new user (customer or professional)"""
    # Check if email exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    user_dict["created_at"] = datetime.utcnow()
    
    if user.user_type == "professional":
        user_dict["rating"] = 5.0
        user_dict["total_jobs"] = 0
        user_dict["available"] = True
        user_dict["location"] = None
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    return UserResponse(**serialize_doc(created_user))

@api_router.post("/auth/login")
async def login_user(credentials: UserLogin):
    """Login user and return user data"""
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_data = serialize_doc(user)
    del user_data["password"]
    return {"user": user_data, "message": "Login successful"}

# ==================== Service Routes ====================

@api_router.get("/services", response_model=List[ServiceResponse])
async def get_services(category: Optional[str] = None):
    """Get all services, optionally filtered by category"""
    query = {"category": category} if category else {}
    services = await db.services.find(query).to_list(1000)
    return [ServiceResponse(**serialize_doc(s)) for s in services]

@api_router.get("/services/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: str):
    """Get a specific service by ID"""
    try:
        service = await db.services.find_one({"_id": ObjectId(service_id)})
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        return ServiceResponse(**serialize_doc(service))
    except Exception as e:
        if "ObjectId" in str(e) or "invalid" in str(e).lower():
            raise HTTPException(status_code=400, detail="Invalid service ID format")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/categories")
async def get_categories():
    """Get all unique service categories"""
    categories = await db.services.distinct("category")
    return {"categories": categories}

@api_router.post("/services", response_model=ServiceResponse)
async def create_service(service: ServiceCreate):
    """Create a new service (admin only for now)"""
    service_dict = service.dict()
    service_dict["created_at"] = datetime.utcnow()
    result = await db.services.insert_one(service_dict)
    created_service = await db.services.find_one({"_id": result.inserted_id})
    return ServiceResponse(**serialize_doc(created_service))

# ==================== Booking Routes ====================

@api_router.post("/bookings", response_model=BookingResponse)
async def create_booking(booking: BookingCreate):
    """Create a new booking"""
    # Get service details
    service = await db.services.find_one({"_id": ObjectId(booking.service_id)})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get customer details
    customer = await db.users.find_one({"_id": ObjectId(booking.customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    booking_dict = booking.dict()
    booking_dict["service_name"] = service["name"]
    booking_dict["service_price"] = service["fixed_price"]
    booking_dict["status"] = "pending"
    booking_dict["payment_status"] = "pending"
    booking_dict["created_at"] = datetime.utcnow()
    booking_dict["professional_id"] = None
    booking_dict["actual_start"] = None
    booking_dict["actual_end"] = None
    
    result = await db.bookings.insert_one(booking_dict)
    created_booking = await db.bookings.find_one({"_id": result.inserted_id})
    return BookingResponse(**serialize_doc(created_booking))

@api_router.get("/bookings/customer/{customer_id}", response_model=List[BookingResponse])
async def get_customer_bookings(customer_id: str):
    """Get all bookings for a customer"""
    bookings = await db.bookings.find({"customer_id": customer_id}).sort("created_at", -1).to_list(1000)
    return [BookingResponse(**serialize_doc(b)) for b in bookings]

@api_router.get("/bookings/professional/{professional_id}", response_model=List[BookingResponse])
async def get_professional_bookings(professional_id: str):
    """Get all bookings for a professional"""
    bookings = await db.bookings.find({"professional_id": professional_id}).sort("created_at", -1).to_list(1000)
    return [BookingResponse(**serialize_doc(b)) for b in bookings]

@api_router.get("/bookings/pending")
async def get_pending_bookings():
    """Get all pending bookings for professionals to accept"""
    bookings = await db.bookings.find({"status": "pending"}).sort("created_at", -1).to_list(1000)
    return [BookingResponse(**serialize_doc(b)) for b in bookings]

@api_router.get("/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: str):
    """Get a specific booking"""
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return BookingResponse(**serialize_doc(booking))

@api_router.patch("/bookings/{booking_id}", response_model=BookingResponse)
async def update_booking(booking_id: str, update: BookingUpdate):
    """Update booking status"""
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    
    if update_dict:
        await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_dict}
        )
    
    updated_booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    
    # Send WebSocket notification
    if update.status:
        await manager.send_personal_message(
            {"type": "booking_update", "booking_id": booking_id, "status": update.status},
            booking["customer_id"]
        )
    
    return BookingResponse(**serialize_doc(updated_booking))

# ==================== Professional Routes ====================

@api_router.get("/professionals", response_model=List[ProfessionalResponse])
async def get_professionals(skill: Optional[str] = None, available: Optional[bool] = None):
    """Get all professionals, optionally filtered"""
    query = {"user_type": "professional"}
    if skill:
        query["skills"] = {"$in": [skill]}
    if available is not None:
        query["available"] = available
    
    professionals = await db.users.find(query).to_list(1000)
    result = []
    for p in professionals:
        p_dict = serialize_doc(p)
        # Ensure required fields exist with defaults
        if "skills" not in p_dict:
            p_dict["skills"] = []
        if "bio" not in p_dict:
            p_dict["bio"] = None
        if "rating" not in p_dict:
            p_dict["rating"] = 5.0
        if "total_jobs" not in p_dict:
            p_dict["total_jobs"] = 0
        if "available" not in p_dict:
            p_dict["available"] = True
        if "location" not in p_dict:
            p_dict["location"] = None
        result.append(ProfessionalResponse(**p_dict))
    return result

@api_router.get("/professionals/{professional_id}", response_model=ProfessionalResponse)
async def get_professional(professional_id: str):
    """Get professional details"""
    professional = await db.users.find_one({"_id": ObjectId(professional_id), "user_type": "professional"})
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return ProfessionalResponse(**serialize_doc(professional))

@api_router.patch("/professionals/{professional_id}/location")
async def update_professional_location(professional_id: str, location: LocationUpdate):
    """Update professional's real-time location"""
    await db.users.update_one(
        {"_id": ObjectId(professional_id)},
        {"$set": {"location": location.dict()}}
    )
    
    # Find active booking for this professional
    active_booking = await db.bookings.find_one({
        "professional_id": professional_id,
        "status": {"$in": ["accepted", "in_progress"]}
    })
    
    # Send location update to customer if there's an active booking
    if active_booking:
        await manager.send_personal_message(
            {
                "type": "location_update",
                "professional_id": professional_id,
                "location": location.dict()
            },
            active_booking["customer_id"]
        )
    
    return {"message": "Location updated successfully"}

@api_router.patch("/professionals/{professional_id}/availability")
async def update_availability(professional_id: str, available: bool = None):
    """Toggle professional availability"""
    if available is None:
        raise HTTPException(status_code=400, detail="Available parameter is required")
    
    await db.users.update_one(
        {"_id": ObjectId(professional_id)},
        {"$set": {"available": available}}
    )
    return {"message": "Availability updated", "available": available}

# ==================== Review Routes ====================

@api_router.post("/reviews", response_model=ReviewResponse)
async def create_review(review: ReviewCreate):
    """Create a review for a completed booking"""
    # Verify booking exists and is completed
    booking = await db.bookings.find_one({"_id": ObjectId(review.booking_id)})
    if not booking or booking["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed bookings")
    
    # Check if review already exists
    existing = await db.reviews.find_one({"booking_id": review.booking_id})
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")
    
    # Get customer name
    customer = await db.users.find_one({"_id": ObjectId(review.customer_id)})
    
    review_dict = review.dict()
    review_dict["customer_name"] = customer["name"] if customer else "Anonymous"
    review_dict["created_at"] = datetime.utcnow()
    
    result = await db.reviews.insert_one(review_dict)
    
    # Update professional rating
    reviews = await db.reviews.find({"professional_id": review.professional_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.users.update_one(
        {"_id": ObjectId(review.professional_id)},
        {"$set": {"rating": round(avg_rating, 1)}}
    )
    
    created_review = await db.reviews.find_one({"_id": result.inserted_id})
    return ReviewResponse(**serialize_doc(created_review))

@api_router.get("/reviews/professional/{professional_id}", response_model=List[ReviewResponse])
async def get_professional_reviews(professional_id: str):
    """Get all reviews for a professional"""
    reviews = await db.reviews.find({"professional_id": professional_id}).sort("created_at", -1).to_list(1000)
    return [ReviewResponse(**serialize_doc(r)) for r in reviews]

# ==================== Payment Routes ====================

@api_router.post("/checkout/session")
async def create_checkout_session(payment: PaymentRequest):
    """Create a Stripe checkout session for booking payment"""
    # Get booking details
    booking = await db.bookings.find_one({"_id": ObjectId(payment.booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Initialize Stripe
    webhook_url = f"{payment.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{payment.origin_url}/payment-success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{payment.origin_url}/payment-cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(booking["service_price"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "booking_id": payment.booking_id,
            "customer_id": booking["customer_id"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    await db.payment_transactions.insert_one({
        "booking_id": payment.booking_id,
        "session_id": session.session_id,
        "amount": booking["service_price"],
        "currency": "usd",
        "payment_status": "pending",
        "metadata": checkout_request.metadata,
        "created_at": datetime.utcnow()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    """Check payment status"""
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if transaction and status.payment_status == "paid":
        # Check if already processed
        if transaction.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.utcnow()}}
            )
            
            # Update booking payment status
            await db.bookings.update_one(
                {"_id": ObjectId(transaction["booking_id"])},
                {"$set": {"payment_status": "paid"}}
            )
    
    return status.dict()

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Handle Stripe webhooks"""
    body = await request.body()
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        logger.info(f"Webhook received: {webhook_response.event_type}")
        
        # Handle successful payment
        if webhook_response.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id})
            if transaction and transaction.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "updated_at": datetime.utcnow()}}
                )
                
                await db.bookings.update_one(
                    {"_id": ObjectId(transaction["booking_id"])},
                    {"$set": {"payment_status": "paid"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ==================== AI Recommendations ====================

@api_router.get("/recommendations/{customer_id}")
async def get_recommendations(customer_id: str):
    """Get AI-powered service recommendations based on user history"""
    # Get customer's booking history
    bookings = await db.bookings.find({"customer_id": customer_id}).to_list(1000)
    
    if not bookings:
        # No history, return popular services
        popular_services = await db.services.find().limit(5).to_list(5)
        return {
            "recommendations": [ServiceResponse(**serialize_doc(s)) for s in popular_services],
            "reason": "Popular services"
        }
    
    # Get service IDs from bookings
    service_ids = [b["service_id"] for b in bookings]
    booked_services = await db.services.find({"_id": {"$in": [ObjectId(sid) for sid in service_ids]}}).to_list(1000)
    
    # Prepare context for AI
    service_history = ", ".join([s["name"] for s in booked_services])
    
    # Use AI to get recommendations
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"recommendations_{customer_id}",
        system_message="You are a helpful assistant that recommends home services based on user history. Provide 3-5 relevant service recommendations."
    ).with_model("openai", "gpt-4o-mini")
    
    message = UserMessage(
        text=f"Based on these previously booked services: {service_history}, recommend 3-5 other home services this customer might need. Return only the service names as a comma-separated list."
    )
    
    try:
        response = await chat.send_message(message)
        recommended_names = [name.strip() for name in response.split(",")]
        
        # Find matching services
        all_services = await db.services.find().to_list(1000)
        recommendations = []
        
        for rec_name in recommended_names:
            for service in all_services:
                if rec_name.lower() in service["name"].lower() or service["name"].lower() in rec_name.lower():
                    if service not in recommendations:
                        recommendations.append(service)
                        break
        
        # If AI recommendations don't match, return popular services not yet booked
        if not recommendations:
            recommendations = [s for s in all_services if str(s["_id"]) not in service_ids][:5]
        
        return {
            "recommendations": [ServiceResponse(**serialize_doc(s)) for s in recommendations[:5]],
            "reason": "AI-powered recommendations based on your history"
        }
    except Exception as e:
        logger.error(f"AI recommendation error: {e}")
        # Fallback to simple recommendations
        all_services = await db.services.find().to_list(1000)
        recommendations = [s for s in all_services if str(s["_id"]) not in service_ids][:5]
        return {
            "recommendations": [ServiceResponse(**serialize_doc(s)) for s in recommendations],
            "reason": "Services you haven't tried yet"
        }

# ==================== WebSocket ====================

@api_router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            logger.info(f"Received WebSocket message: {message}")
            # Echo back for now
            await websocket.send_json({"type": "ack", "data": message})
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

# ==================== Seed Data ====================

@api_router.post("/seed/services")
async def seed_services():
    """Seed the database with initial services"""
    services = [
        # Cleaning Services
        {"category": "Cleaning", "name": "General Home Cleaning", "description": "Complete home cleaning including all rooms", "fixed_price": 80.0, "estimated_duration": 120},
        {"category": "Cleaning", "name": "Deep Cleaning", "description": "Thorough deep cleaning of entire home", "fixed_price": 150.0, "estimated_duration": 240},
        {"category": "Cleaning", "name": "Carpet Cleaning", "description": "Professional carpet steam cleaning", "fixed_price": 120.0, "estimated_duration": 90},
        {"category": "Cleaning", "name": "Window Cleaning", "description": "Interior and exterior window cleaning", "fixed_price": 60.0, "estimated_duration": 60},
        
        # Plumbing Services
        {"category": "Plumbing", "name": "Leak Repair", "description": "Fix leaking pipes and faucets", "fixed_price": 100.0, "estimated_duration": 60},
        {"category": "Plumbing", "name": "Drain Unclogging", "description": "Clear blocked drains and pipes", "fixed_price": 90.0, "estimated_duration": 45},
        {"category": "Plumbing", "name": "Toilet Repair", "description": "Fix or replace toilet components", "fixed_price": 85.0, "estimated_duration": 60},
        {"category": "Plumbing", "name": "Water Heater Service", "description": "Maintenance and repair of water heaters", "fixed_price": 150.0, "estimated_duration": 120},
        
        # Electrical Services
        {"category": "Electrical", "name": "Light Fixture Installation", "description": "Install new light fixtures and switches", "fixed_price": 75.0, "estimated_duration": 45},
        {"category": "Electrical", "name": "Outlet Repair", "description": "Fix or replace electrical outlets", "fixed_price": 65.0, "estimated_duration": 30},
        {"category": "Electrical", "name": "Circuit Breaker Check", "description": "Inspect and repair circuit breakers", "fixed_price": 100.0, "estimated_duration": 60},
        {"category": "Electrical", "name": "Ceiling Fan Installation", "description": "Install ceiling fans", "fixed_price": 95.0, "estimated_duration": 90},
        
        # HVAC Services
        {"category": "HVAC", "name": "AC Maintenance", "description": "Air conditioner cleaning and maintenance", "fixed_price": 120.0, "estimated_duration": 90},
        {"category": "HVAC", "name": "Heater Repair", "description": "Diagnose and repair heating systems", "fixed_price": 130.0, "estimated_duration": 120},
        {"category": "HVAC", "name": "Air Duct Cleaning", "description": "Clean air ducts and vents", "fixed_price": 180.0, "estimated_duration": 180},
        
        # Appliance Repair
        {"category": "Appliances", "name": "Refrigerator Repair", "description": "Fix refrigerator issues", "fixed_price": 140.0, "estimated_duration": 90},
        {"category": "Appliances", "name": "Washing Machine Repair", "description": "Repair washing machine problems", "fixed_price": 110.0, "estimated_duration": 75},
        {"category": "Appliances", "name": "Dishwasher Repair", "description": "Fix dishwasher issues", "fixed_price": 100.0, "estimated_duration": 60},
        
        # Handyman Services
        {"category": "Handyman", "name": "Furniture Assembly", "description": "Assemble furniture items", "fixed_price": 60.0, "estimated_duration": 60},
        {"category": "Handyman", "name": "Picture Hanging", "description": "Hang pictures and mirrors", "fixed_price": 40.0, "estimated_duration": 30},
        {"category": "Handyman", "name": "Door Installation", "description": "Install interior doors", "fixed_price": 150.0, "estimated_duration": 120},
        {"category": "Handyman", "name": "Drywall Repair", "description": "Fix holes and cracks in drywall", "fixed_price": 90.0, "estimated_duration": 90},
        
        # Painting Services
        {"category": "Painting", "name": "Room Painting", "description": "Paint a single room", "fixed_price": 200.0, "estimated_duration": 300},
        {"category": "Painting", "name": "Touch-up Painting", "description": "Touch up paint in various areas", "fixed_price": 80.0, "estimated_duration": 60},
        
        # Landscaping Services
        {"category": "Landscaping", "name": "Lawn Mowing", "description": "Mow and edge lawn", "fixed_price": 50.0, "estimated_duration": 45},
        {"category": "Landscaping", "name": "Garden Maintenance", "description": "Weeding and plant care", "fixed_price": 70.0, "estimated_duration": 90},
        {"category": "Landscaping", "name": "Tree Trimming", "description": "Trim trees and bushes", "fixed_price": 120.0, "estimated_duration": 120},
        
        # Pest Control
        {"category": "Pest Control", "name": "General Pest Treatment", "description": "Treat home for common pests", "fixed_price": 100.0, "estimated_duration": 60},
        {"category": "Pest Control", "name": "Termite Inspection", "description": "Inspect for termites", "fixed_price": 80.0, "estimated_duration": 45},
        
        # Locksmith Services
        {"category": "Locksmith", "name": "Lock Change", "description": "Change door locks", "fixed_price": 90.0, "estimated_duration": 30},
        {"category": "Locksmith", "name": "Emergency Lockout", "description": "24/7 lockout service", "fixed_price": 120.0, "estimated_duration": 30},
    ]
    
    # Check if services already exist
    existing_count = await db.services.count_documents({})
    if existing_count > 0:
        return {"message": f"Services already seeded ({existing_count} services exist)"}
    
    # Add timestamps
    for service in services:
        service["created_at"] = datetime.utcnow()
        service["image_base64"] = None
    
    await db.services.insert_many(services)
    return {"message": f"Successfully seeded {len(services)} services"}


# ==================== Admin APIs ====================

class BannerModel(BaseModel):
    title: str
    subtitle: str
    button_text: str
    active: bool = True
    created_at: Optional[datetime] = None

class FeaturedCategoryModel(BaseModel):
    category: str
    priority: int = 0
    active: bool = True

class CategoryIconModel(BaseModel):
    category: str
    icon: str
    color: str

@api_router.post("/admin/banner")
async def create_or_update_banner(banner: BannerModel):
    """Create or update promotional banner"""
    banner_dict = banner.dict()
    banner_dict["created_at"] = datetime.utcnow()
    
    # Deactivate all existing banners if this one is active
    if banner.active:
        await db.banners.update_many({}, {"$set": {"active": False}})
    
    result = await db.banners.insert_one(banner_dict)
    created_banner = await db.banners.find_one({"_id": result.inserted_id})
    return {"message": "Banner created successfully", "banner": serialize_doc(created_banner)}

@api_router.get("/admin/banner/active")
async def get_active_banner():
    """Get currently active banner"""
    banner = await db.banners.find_one({"active": True}, sort=[("created_at", -1)])
    if not banner:
        return {"banner": None}
    
    banner["id"] = str(banner["_id"])
    del banner["_id"]
    return {"banner": banner}

@api_router.get("/admin/banners")
async def get_all_banners():
    """Get all banners"""
    banners = []
    async for banner in db.banners.find().sort("created_at", -1):
        banner["id"] = str(banner["_id"])
        del banner["_id"]
        banners.append(banner)
    return {"banners": banners}

@api_router.put("/admin/banner/{banner_id}/activate")
async def activate_banner(banner_id: str):
    """Activate a specific banner"""
    if not ObjectId.is_valid(banner_id):
        raise HTTPException(status_code=400, detail="Invalid banner ID")
    
    # Deactivate all banners
    await db.banners.update_many({}, {"$set": {"active": False}})
    
    # Activate the specified banner
    result = await db.banners.update_one(
        {"_id": ObjectId(banner_id)},
        {"$set": {"active": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    return {"message": "Banner activated successfully"}

@api_router.delete("/admin/banner/{banner_id}")
async def delete_banner(banner_id: str):
    """Delete a banner"""
    if not ObjectId.is_valid(banner_id):
        raise HTTPException(status_code=400, detail="Invalid banner ID")
    
    result = await db.banners.delete_one({"_id": ObjectId(banner_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    return {"message": "Banner deleted successfully"}

@api_router.post("/admin/featured-categories")
async def set_featured_categories(categories: List[FeaturedCategoryModel]):
    """Set featured categories"""
    # Clear existing featured categories
    await db.featured_categories.delete_many({})
    
    # Insert new ones
    categories_dict = [cat.dict() for cat in categories]
    for cat in categories_dict:
        cat["created_at"] = datetime.utcnow()
    
    if categories_dict:
        await db.featured_categories.insert_many(categories_dict)
    
    return {"message": f"Featured categories updated ({len(categories_dict)} categories)"}

@api_router.get("/admin/featured-categories")
async def get_featured_categories():
    """Get featured categories"""
    categories = []
    async for cat in db.featured_categories.find({"active": True}).sort("priority", -1):
        cat["id"] = str(cat["_id"])
        del cat["_id"]
        categories.append(cat)
    return {"categories": categories}

@api_router.post("/admin/category-icons")
async def update_category_icons(icons: List[CategoryIconModel]):
    """Update category icons"""
    for icon_model in icons:
        await db.category_icons.update_one(
            {"category": icon_model.category},
            {"$set": icon_model.dict()},
            upsert=True
        )
    
    return {"message": f"Updated {len(icons)} category icons"}

@api_router.get("/admin/category-icons")
async def get_category_icons():
    """Get all category icons"""
    icons = []
    async for icon in db.category_icons.find():
        icon["id"] = str(icon["_id"])
        del icon["_id"]
        icons.append(icon)
    return {"icons": icons}

@api_router.get("/admin/stats")
async def get_admin_stats():
    """Get platform statistics"""
    total_users = await db.users.count_documents({})
    total_customers = await db.users.count_documents({"user_type": "customer"})
    total_professionals = await db.users.count_documents({"user_type": "professional"})
    total_services = await db.services.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    completed_bookings = await db.bookings.count_documents({"status": "completed"})
    
    # Calculate total revenue
    revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$lookup": {
            "from": "services",
            "localField": "service_id",
            "foreignField": "_id",
            "as": "service"
        }},
        {"$unwind": "$service"},
        {"$group": {
            "_id": None,
            "total": {"$sum": "$service.fixed_price"}
        }}
    ]
    
    revenue_result = await db.bookings.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "stats": {
            "total_users": total_users,
            "total_customers": total_customers,
            "total_professionals": total_professionals,
            "total_services": total_services,
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
            "completed_bookings": completed_bookings,
            "total_revenue": total_revenue,
        }
    }

# ==================== Admin Service Management ====================

class ServiceUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    fixed_price: Optional[float] = None
    estimated_duration: Optional[int] = None
    image_url: Optional[str] = None

@api_router.get("/admin/services")
async def admin_get_all_services():
    """Get all services for admin management"""
    services = []
    async for service in db.services.find().sort("category", 1):
        service["id"] = str(service["_id"])
        del service["_id"]
        services.append(service)
    return {"services": services, "total": len(services)}

@api_router.get("/admin/services/{service_id}")
async def admin_get_service(service_id: str):
    """Get single service details for editing"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    service = await db.services.find_one({"_id": ObjectId(service_id)})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service["id"] = str(service["_id"])
    del service["_id"]
    return service

@api_router.put("/admin/services/{service_id}")
async def admin_update_service(service_id: str, update: ServiceUpdate):
    """Update service details"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get updated service
    updated_service = await db.services.find_one({"_id": ObjectId(service_id)})
    updated_service["id"] = str(updated_service["_id"])
    del updated_service["_id"]
    
    return {"message": "Service updated successfully", "service": updated_service}

@api_router.post("/admin/services")
async def admin_create_service(service: ServiceCreate):
    """Create new service"""
    service_dict = service.dict()
    service_dict["created_at"] = datetime.utcnow()
    
    result = await db.services.insert_one(service_dict)
    created_service = await db.services.find_one({"_id": result.inserted_id})
    created_service["id"] = str(created_service["_id"])
    del created_service["_id"]
    
    return {"message": "Service created successfully", "service": created_service}

@api_router.delete("/admin/services/{service_id}")
async def admin_delete_service(service_id: str):
    """Delete a service"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    # Check if service has active bookings
    active_bookings = await db.bookings.count_documents({
        "service_id": service_id,  # service_id is stored as string in bookings
        "status": {"$in": ["pending", "confirmed", "in_progress"]}
    })
    
    if active_bookings > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete service with {active_bookings} active bookings"
        )
    
    result = await db.services.delete_one({"_id": ObjectId(service_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service deleted successfully"}


# Root routes
@api_router.get("/")
async def root():
    return {"message": "ExperTrait Home Services API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

# Serve landing page
@app.get("/", response_class=HTMLResponse)
async def landing_page():
    website_path = Path(__file__).parent.parent / "website" / "index.html"
    if website_path.exists():
        with open(website_path, "r") as f:
            return f.read()
    return HTMLResponse("<h1>Welcome to ExperTrait</h1>")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
