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
from datetime import datetime, timedelta, timedelta
from bson import ObjectId
import bcrypt
import json
import stripe
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
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@expertrait.com')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@expertrait.com')

# Stripe Connect Keys
STRIPE_TEST_SECRET_KEY = os.environ.get('STRIPE_TEST_SECRET_KEY')
STRIPE_TEST_PUBLISHABLE_KEY = os.environ.get('STRIPE_TEST_PUBLISHABLE_KEY')
STRIPE_LIVE_SECRET_KEY = os.environ.get('STRIPE_LIVE_SECRET_KEY')
STRIPE_LIVE_PUBLISHABLE_KEY = os.environ.get('STRIPE_LIVE_PUBLISHABLE_KEY')

# Helper function to get active Stripe key
async def get_stripe_key():
    """Get the active Stripe secret key based on company settings"""
    settings = await db.company_settings.find_one()
    use_live_stripe = settings.get("use_live_stripe", False) if settings else False
    
    if use_live_stripe:
        return STRIPE_LIVE_SECRET_KEY, STRIPE_LIVE_PUBLISHABLE_KEY
    else:
        return STRIPE_TEST_SECRET_KEY, STRIPE_TEST_PUBLISHABLE_KEY

# Email helper function using SendGrid
async def send_admin_alert_email(subject: str, body: str):
    """Send alert email to admin using SendGrid"""
    if not SENDGRID_API_KEY:
        print(f"📧 ADMIN ALERT EMAIL (SendGrid not configured)")
        print(f"To: {ADMIN_EMAIL}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        return True
    
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=ADMIN_EMAIL,
            subject=subject,
            html_content=body.replace('\n', '<br>')
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        print(f"📧 Email sent successfully to {ADMIN_EMAIL}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return False

async def send_verification_email(to_email: str, subject: str, body: str):
    """Send verification email using SendGrid"""
    if not SENDGRID_API_KEY:
        print(f"📧 VERIFICATION EMAIL (SendGrid not configured)")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        return True
    
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=body.replace('\n', '<br>')
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        print(f"📧 Verification email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send verification email: {str(e)}")
        return False

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
    user_type: str = "customer"  # "customer" or "handler"
    skills: Optional[List[str]] = []  # For handlers - list of service categories they can handle

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

class HandlerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    skills: List[str]
    bio: Optional[str] = None

class HandlerResponse(BaseModel):
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
    included_items: Optional[List[str]] = []
    excluded_items: Optional[List[str]] = []

class ServiceResponse(BaseModel):
    id: str
    category: str
    name: str
    description: str
    fixed_price: float
    estimated_duration: int
    image_base64: Optional[str] = None
    included_items: Optional[List[str]] = []
    excluded_items: Optional[List[str]] = []
    created_at: datetime

class BookingCreate(BaseModel):
    service_id: str
    customer_id: str
    scheduled_date: str  # Date in YYYY-MM-DD format
    time_range_start: str  # Time in HH:MM format
    time_range_end: str  # Time in HH:MM format
    location: LocationModel
    notes: Optional[str] = None
    booking_type: str = "one-off"  # "one-off" or "continuous"
    terms_agreed: bool = False
    service_category: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    service_id: str
    customer_id: str
    handler_id: Optional[str] = None
    service_name: str
    service_price: float
    service_category: Optional[str] = None
    status: str  # pending, accepted, in_progress, completed, cancelled
    scheduled_date: Optional[str] = None
    time_range_start: Optional[str] = None
    time_range_end: Optional[str] = None
    scheduled_time: Optional[datetime] = None  # For backward compatibility
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    check_in_time: Optional[datetime] = None
    check_in_location: Optional[LocationModel] = None
    check_out_time: Optional[datetime] = None
    check_out_location: Optional[LocationModel] = None
    location: Optional[LocationModel] = None
    notes: Optional[str] = None
    booking_type: str = "one-off"
    terms_agreed: bool = False
    payment_status: str = "pending"
    created_at: datetime

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    handler_id: Optional[str] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None

class ReviewCreate(BaseModel):
    booking_id: str
    customer_id: str
    handler_id: str
    rating: int  # 1-5
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    customer_id: str
    customer_name: str
    handler_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

class LocationUpdate(BaseModel):
    handler_id: str
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class PaymentRequest(BaseModel):
    booking_id: str
    origin_url: str

class BulkBookingCreate(BaseModel):
    service_ids: List[str]
    customer_id: str
    scheduled_date: str
    time_range_start: str
    time_range_end: str
    location: LocationModel
    notes: Optional[str] = None
    booking_type: str = "one-off"
    terms_agreed: bool = False

class CheckInRequest(BaseModel):
    booking_id: str
    handler_id: str
    latitude: float
    longitude: float
    check_in_photo: Optional[str] = None

class CheckOutRequest(BaseModel):
    booking_id: str
    handler_id: str
    latitude: float
    longitude: float
    check_out_photo: Optional[str] = None
    completion_notes: Optional[str] = None

class BankAccountModel(BaseModel):
    account_holder_name: str
    account_number: str
    sort_code: str
    bank_name: str

class BankAccountUpdateRequest(BaseModel):
    handler_id: str
    bank_account: BankAccountModel

class AvailabilitySlot(BaseModel):
    date: str  # YYYY-MM-DD
    available: bool
    time_slots: Optional[List[str]] = []

class HandlerAvailabilityUpdate(BaseModel):
    handler_id: str
    availability_slots: List[AvailabilitySlot]

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
    """Register a new user (customer or handler)"""
    # Check if email exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    user_dict["created_at"] = datetime.utcnow()
    
    if user.user_type == "handler":
        user_dict["rating"] = 5.0
        user_dict["total_jobs"] = 0
        user_dict["available"] = True
        user_dict["location"] = None
        # Save skills for handlers
        user_dict["skills"] = user.skills if user.skills else []
    else:
        # Customers don't need skills
        user_dict.pop("skills", None)
    
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
    """Create a single booking"""
    # Validate terms agreed
    if not booking.terms_agreed:
        raise HTTPException(status_code=400, detail="You must agree to the terms before booking")
    
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
    booking_dict["service_category"] = service.get("category", booking.service_category)
    booking_dict["status"] = "pending"
    booking_dict["payment_status"] = "pending"
    booking_dict["created_at"] = datetime.utcnow()
    booking_dict["handler_id"] = None
    booking_dict["actual_start"] = None
    booking_dict["actual_end"] = None
    
    result = await db.bookings.insert_one(booking_dict)
    created_booking = await db.bookings.find_one({"_id": result.inserted_id})
    return BookingResponse(**serialize_doc(created_booking))

@api_router.post("/bookings/bulk")
async def create_bulk_bookings(bulk_booking: BulkBookingCreate):
    """Create multiple bookings, automatically splitting by category"""
    # Validate terms agreed
    if not bulk_booking.terms_agreed:
        raise HTTPException(status_code=400, detail="You must agree to the terms before booking")
    
    # Get customer details
    customer = await db.users.find_one({"_id": ObjectId(bulk_booking.customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get all services and group by category
    services_by_category = {}
    for service_id in bulk_booking.service_ids:
        service = await db.services.find_one({"_id": ObjectId(service_id)})
        if not service:
            continue
        
        category = service.get("category", "General")
        if category not in services_by_category:
            services_by_category[category] = []
        services_by_category[category].append(service)
    
    # Create separate bookings for each category
    created_bookings = []
    for category, services in services_by_category.items():
        # Calculate total price for services in this category
        total_price = sum(s["fixed_price"] for s in services)
        service_names = ", ".join(s["name"] for s in services)
        service_ids_list = [str(s["_id"]) for s in services]
        
        booking_dict = {
            "service_id": service_ids_list[0] if len(service_ids_list) == 1 else None,
            "service_ids": service_ids_list,
            "customer_id": bulk_booking.customer_id,
            "service_name": service_names,
            "service_price": total_price,
            "service_category": category,
            "status": "pending",
            "scheduled_date": bulk_booking.scheduled_date,
            "time_range_start": bulk_booking.time_range_start,
            "time_range_end": bulk_booking.time_range_end,
            "location": bulk_booking.location.dict(),
            "notes": bulk_booking.notes,
            "booking_type": bulk_booking.booking_type,
            "terms_agreed": bulk_booking.terms_agreed,
            "payment_status": "pending",
            "created_at": datetime.utcnow(),
            "handler_id": None,
            "actual_start": None,
            "actual_end": None
        }
        
        result = await db.bookings.insert_one(booking_dict)
        created_booking = await db.bookings.find_one({"_id": result.inserted_id})
        created_bookings.append(serialize_doc(created_booking))
    
    # Check for handler availability and send admin alert if no match found
    for booking in created_bookings:
        if not booking.get("handler_id"):
            # Try to find available handlers
            category = booking.get("service_category")
            available_handlers = await db.users.find({
                "user_type": "handler",
                "skills": category,
                "available": True
            }).to_list(10)
            
            if len(available_handlers) == 0:
                # No handlers found - send admin alert
                customer_name = customer.get("name", "Unknown")
                await send_admin_alert_email(
                    subject=f"⚠️ Unmatched Booking Alert - No Handler Available",
                    body=f"""
                    Booking ID: {booking['id']}
                    Customer: {customer_name}
                    Service: {booking['service_name']}
                    Category: {category}
                    Date: {booking['scheduled_date']}
                    Time: {booking['time_range_start']} - {booking['time_range_end']}
                    
                    No available handlers found for this booking.
                    Please assign manually from the admin dashboard.
                    """
                )
    
    return {
        "message": f"Created {len(created_bookings)} booking(s) grouped by category",
        "bookings": created_bookings,
        "total_bookings": len(created_bookings)
    }

@api_router.get("/bookings/customer/{customer_id}", response_model=List[BookingResponse])
async def get_customer_bookings(customer_id: str):
    """Get all bookings for a customer"""
    bookings = await db.bookings.find({"customer_id": customer_id}).sort("created_at", -1).to_list(1000)
    return [BookingResponse(**serialize_doc(b)) for b in bookings]

@api_router.get("/bookings/handler/{handler_id}", response_model=List[BookingResponse])
async def get_handler_bookings(handler_id: str):
    """Get all bookings for a handler"""
    bookings = await db.bookings.find({"handler_id": handler_id}).sort("created_at", -1).to_list(1000)
    return [BookingResponse(**serialize_doc(b)) for b in bookings]

@api_router.get("/bookings/pending")
async def get_pending_bookings():
    """Get all pending bookings for handlers to accept"""
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

# ==================== Handler Routes ====================

@api_router.get("/handlers", response_model=List[HandlerResponse])
async def get_handlers(skill: Optional[str] = None, available: Optional[bool] = None):
    """Get all handlers, optionally filtered"""
    query = {"user_type": "handler"}
    if skill:
        query["skills"] = {"$in": [skill]}
    if available is not None:
        query["available"] = available
    
    handlers = await db.users.find(query).to_list(1000)
    result = []
    for p in handlers:
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
        result.append(HandlerResponse(**p_dict))
    return result

@api_router.get("/handlers/{handler_id}", response_model=HandlerResponse)
async def get_handler(handler_id: str):
    """Get handler details"""
    handler = await db.users.find_one({"_id": ObjectId(handler_id), "user_type": "handler"})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    return HandlerResponse(**serialize_doc(handler))

@api_router.patch("/handlers/{handler_id}/location")
async def update_handler_location(handler_id: str, location: LocationUpdate):
    """Update handler's real-time location"""
    await db.users.update_one(
        {"_id": ObjectId(handler_id)},
        {"$set": {"location": location.dict()}}
    )
    


# ==================== Auto-Assignment Algorithm ====================

from math import radians, cos, sin, asin, sqrt

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in miles using Haversine formula"""
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    miles = 3959 * c  # Earth radius in miles
    
    return miles

async def find_best_handler(booking_id: str):
    """Find and assign the best handler for a booking"""
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        return None
    
    # Get service details
    service = await db.services.find_one({"_id": ObjectId(booking["service_id"])})
    if not service:
        return None
    
    booking_location = booking.get("location", {})
    booking_lat = booking_location.get("latitude", 0)
    booking_lon = booking_location.get("longitude", 0)
    
    # Find all active handlers
    handlers = []
    async for handler in db.users.find({"user_type": "handler", "status": "active"}):
        handler_id = str(handler["_id"])
        
        # Check skills match
        handler_skills = handler.get("skills", [])
        service_category = service.get("category", "")
        
        # Calculate distance
        handler_location = handler.get("location", {})
        handler_lat = handler_location.get("latitude", 0)
        handler_lon = handler_location.get("longitude", 0)
        
        if handler_lat and handler_lon and booking_lat and booking_lon:
            distance = calculate_distance(booking_lat, booking_lon, handler_lat, handler_lon)
        else:
            distance = 999  # Default large distance
        
        # Check availability
        availability = await db.availability.find_one({"handler_id": handler_id})
        is_available = availability is not None if availability else True
        
        # Get handler rating
        handler_rating = handler.get("rating", 0)
        
        # Get current workload
        active_jobs = await db.bookings.count_documents({
            "handler_id": handler_id,
            "status": {"$in": ["pending", "confirmed", "in_progress"]}
        })
        
        # Calculate score
        score = 0
        
        # Skills match (40 points)
        if service_category in handler_skills or any(skill.lower() in service_category.lower() for skill in handler_skills):
            score += 40
        
        # Proximity (30 points) - inverse of distance
        if distance < 5:
            score += 30
        elif distance < 10:
            score += 20
        elif distance < 20:
            score += 10
        
        # Rating (20 points)
        score += (handler_rating / 5.0) * 20
        
        # Availability (10 points)
        if is_available:
            score += 10
        
        # Workload penalty
        score -= (active_jobs * 5)
        
        handlers.append({
            "handler_id": handler_id,
            "handler_name": handler.get("name"),
            "score": score,
            "distance": distance,
            "rating": handler_rating,
            "active_jobs": active_jobs,
            "skills_match": service_category in handler_skills
        })
    
    # Sort by score
    handlers.sort(key=lambda x: x["score"], reverse=True)
    
    # Assign to best handler
    if handlers and handlers[0]["score"] > 20:  # Minimum score threshold
        best_handler = handlers[0]
        await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {
                "handler_id": best_handler["handler_id"],
                "status": "confirmed",
                "assigned_at": datetime.utcnow()
            }}
        )
        return best_handler
    
    return None

@api_router.post("/bookings/{booking_id}/auto-assign")
async def auto_assign_handler(booking_id: str):
    """Automatically assign the best handler to a booking"""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    result = await find_best_handler(booking_id)
    
    if result:
        return {
            "message": "Handler assigned successfully",
            "handler_id": result["handler_id"],
            "handler_name": result["handler_name"],
            "match_score": result["score"],
            "distance_miles": round(result["distance"], 2)
        }
    else:
        return {
            "message": "No suitable handler found",
            "handler_id": None
        }

@api_router.post("/bookings/batch-auto-assign")
async def batch_auto_assign():
    """Auto-assign all pending bookings"""
    pending_bookings = []
    async for booking in db.bookings.find({"status": "pending", "handler_id": {"$exists": False}}):
        booking_id = str(booking["_id"])
        result = await find_best_handler(booking_id)
        if result:
            pending_bookings.append({
                "booking_id": booking_id,
                "assigned_to": result["handler_name"],
                "score": result["score"]
            })
    
    return {
        "message": f"Assigned {len(pending_bookings)} bookings",
        "assignments": pending_bookings
    }

    # Find active booking for this handler
    active_booking = await db.bookings.find_one({
        "handler_id": handler_id,
        "status": {"$in": ["accepted", "in_progress"]}
    })
    
    # Send location update to customer if there's an active booking
    if active_booking:
        await manager.send_personal_message(
            {
                "type": "location_update",
                "handler_id": handler_id,
                "location": location.dict()
            },
            active_booking["customer_id"]
        )
    
    return {"message": "Location updated successfully"}

@api_router.patch("/handlers/{handler_id}/availability")
async def update_availability(handler_id: str, available: bool = None):
    """Toggle handler availability"""
    if available is None:
        raise HTTPException(status_code=400, detail="Available parameter is required")
    
    await db.users.update_one(
        {"_id": ObjectId(handler_id)},
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
    
    # Update handler rating
    reviews = await db.reviews.find({"handler_id": review.handler_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.users.update_one(
        {"_id": ObjectId(review.handler_id)},
        {"$set": {"rating": round(avg_rating, 1)}}
    )
    
    created_review = await db.reviews.find_one({"_id": result.inserted_id})
    return ReviewResponse(**serialize_doc(created_review))

@api_router.get("/reviews/handler/{handler_id}", response_model=List[ReviewResponse])
async def get_handler_reviews(handler_id: str):
    """Get all reviews for a handler"""
    reviews = await db.reviews.find({"handler_id": handler_id}).sort("created_at", -1).to_list(1000)
    return [ReviewResponse(**serialize_doc(r)) for r in reviews]

# ==================== Handler Operations Routes ====================

@api_router.post("/handler/check-in")
async def handler_check_in(check_in: CheckInRequest):
    """Handler checks in on arrival at booking location"""
    # Validate booking exists
    booking = await db.bookings.find_one({"_id": ObjectId(check_in.booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Validate handler is assigned to this booking
    if booking.get("handler_id") != check_in.handler_id:
        raise HTTPException(status_code=403, detail="Handler not assigned to this booking")
    
    # Update booking with check-in information
    update_data = {
        "check_in_time": datetime.utcnow(),
        "check_in_location": {
            "latitude": check_in.latitude,
            "longitude": check_in.longitude
        },
        "status": "in_progress",
        "actual_start": datetime.utcnow()
    }
    
    if check_in.check_in_photo:
        update_data["check_in_photo"] = check_in.check_in_photo
    
    await db.bookings.update_one(
        {"_id": ObjectId(check_in.booking_id)},
        {"$set": update_data}
    )
    
    return {"message": "Check-in successful", "check_in_time": update_data["check_in_time"]}

@api_router.post("/handler/check-out")
async def handler_check_out(check_out: CheckOutRequest):
    """Handler checks out after completing the job"""
    # Validate booking exists
    booking = await db.bookings.find_one({"_id": ObjectId(check_out.booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Validate handler is assigned to this booking
    if booking.get("handler_id") != check_out.handler_id:
        raise HTTPException(status_code=403, detail="Handler not assigned to this booking")
    
    # Validate that handler has checked in
    if not booking.get("check_in_time"):
        raise HTTPException(status_code=400, detail="Must check in before checking out")
    
    # Update booking with check-out information
    update_data = {
        "check_out_time": datetime.utcnow(),
        "check_out_location": {
            "latitude": check_out.latitude,
            "longitude": check_out.longitude
        },
        "status": "completed",
        "actual_end": datetime.utcnow()
    }
    
    if check_out.check_out_photo:
        update_data["check_out_photo"] = check_out.check_out_photo
    
    if check_out.completion_notes:
        update_data["completion_notes"] = check_out.completion_notes
    
    await db.bookings.update_one(
        {"_id": ObjectId(check_out.booking_id)},
        {"$set": update_data}
    )
    
    # Calculate payment amount and add to handler's wallet
    service_price = booking.get("service_price", 0)
    handler_id = check_out.handler_id
    
    # Get or create handler wallet
    handler = await db.users.find_one({"_id": ObjectId(handler_id)})
    if handler:
        current_wallet_balance = handler.get("wallet_balance", 0)
        new_balance = current_wallet_balance + service_price
        
        await db.users.update_one(
            {"_id": ObjectId(handler_id)},
            {"$set": {"wallet_balance": new_balance}}
        )
        
        # Create wallet transaction record
        await db.wallet_transactions.insert_one({
            "handler_id": handler_id,
            "booking_id": check_out.booking_id,
            "amount": service_price,
            "type": "credit",
            "description": f"Payment for booking {check_out.booking_id}",
            "balance_after": new_balance,
            "created_at": datetime.utcnow()
        })
    
    return {
        "message": "Check-out successful",
        "check_out_time": update_data["check_out_time"],
        "payment_added": service_price,
        "new_wallet_balance": new_balance if handler else 0
    }

@api_router.get("/handler/{handler_id}/wallet")
async def get_handler_wallet(handler_id: str):
    """Get handler's wallet balance and transaction history"""
    handler = await db.users.find_one({"_id": ObjectId(handler_id)})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    wallet_balance = handler.get("wallet_balance", 0)
    
    # Get transaction history
    transactions = await db.wallet_transactions.find(
        {"handler_id": handler_id}
    ).sort("created_at", -1).to_list(100)
    
    return {
        "handler_id": handler_id,
        "wallet_balance": wallet_balance,
        "transactions": [serialize_doc(t) for t in transactions]
    }

@api_router.post("/handler/bank-account")
async def update_handler_bank_account(request: BankAccountUpdateRequest):
    """Update handler's bank account details with email verification"""
    handler = await db.users.find_one({"_id": ObjectId(request.handler_id)})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    # Store pending bank account update
    pending_update = {
        "handler_id": request.handler_id,
        "bank_account": request.bank_account.dict(),
        "status": "pending_verification",
        "verification_token": str(ObjectId()),  # Generate unique token
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=24)
    }
    
    await db.pending_bank_updates.insert_one(pending_update)
    
    # Send verification email to handler
    handler_email = handler.get("email")
    verification_link = f"https://expertrait.com/verify-bank-account/{pending_update['verification_token']}"
    
    email_body = f"""
    <h2>Bank Account Verification</h2>
    <p>Hello {handler.get('name')},</p>
    <p>You have requested to update your bank account details:</p>
    <ul>
        <li>Account Holder: {request.bank_account.account_holder_name}</li>
        <li>Bank: {request.bank_account.bank_name}</li>
        <li>Account Number: ****{request.bank_account.account_number[-4:]}</li>
    </ul>
    <p>Please click the link below to confirm this change:</p>
    <p><a href="{verification_link}">Verify Bank Account Update</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not request this change, please ignore this email.</p>
    """
    
    await send_verification_email(
        to_email=handler_email,
        subject="Verify Your Bank Account Update - ExperTrait",
        body=email_body
    )
    
    return {
        "message": "Verification email sent. Please check your email to confirm the bank account update.",
        "verification_token": pending_update["verification_token"],
        "status": "pending_verification"
    }

@api_router.post("/handler/bank-account/verify/{token}")
async def verify_bank_account_update(token: str):
    """Verify and apply bank account update"""
    pending_update = await db.pending_bank_updates.find_one({"verification_token": token})
    
    if not pending_update:
        raise HTTPException(status_code=404, detail="Verification token not found")
    
    if pending_update.get("status") == "verified":
        raise HTTPException(status_code=400, detail="This verification has already been used")
    
    if datetime.utcnow() > pending_update.get("expires_at"):
        raise HTTPException(status_code=400, detail="Verification token has expired")
    
    # Update handler's bank account
    await db.users.update_one(
        {"_id": ObjectId(pending_update["handler_id"])},
        {"$set": {"bank_account": pending_update["bank_account"]}}
    )
    
    # Mark pending update as verified
    await db.pending_bank_updates.update_one(
        {"verification_token": token},
        {"$set": {"status": "verified", "verified_at": datetime.utcnow()}}
    )
    
    return {
        "message": "Bank account updated successfully",
        "bank_account": pending_update["bank_account"]
    }

@api_router.get("/handler/{handler_id}/bank-account")
async def get_handler_bank_account(handler_id: str):
    """Get handler's bank account details"""
    handler = await db.users.find_one({"_id": ObjectId(handler_id)})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    bank_account = handler.get("bank_account")
    if not bank_account:
        return {"message": "No bank account on file", "bank_account": None}
    
    # Return masked account number for security
    masked_account = bank_account.copy()
    if "account_number" in masked_account:
        masked_account["account_number"] = "****" + masked_account["account_number"][-4:]
    
    return {"bank_account": masked_account}

@api_router.post("/handler/availability")
async def update_handler_availability(request: HandlerAvailabilityUpdate):
    """Update handler's availability calendar for up to 1 month"""
    handler = await db.users.find_one({"_id": ObjectId(request.handler_id)})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    # Validate dates are within 1 month from now
    today = datetime.utcnow().date()
    one_month_later = today + timedelta(days=30)
    
    for slot in request.availability_slots:
        slot_date = datetime.strptime(slot.date, "%Y-%m-%d").date()
        if slot_date < today or slot_date > one_month_later:
            raise HTTPException(
                status_code=400, 
                detail=f"Date {slot.date} is outside the allowed range (today to 30 days ahead)"
            )
    
    # Store availability
    availability_data = {
        "handler_id": request.handler_id,
        "availability_slots": [slot.dict() for slot in request.availability_slots],
        "updated_at": datetime.utcnow()
    }
    
    # Upsert availability
    await db.handler_availability.update_one(
        {"handler_id": request.handler_id},
        {"$set": availability_data},
        upsert=True
    )
    
    return {
        "message": "Availability updated successfully",
        "slots_updated": len(request.availability_slots)
    }

@api_router.get("/handler/{handler_id}/availability")
async def get_handler_availability(handler_id: str):
    """Get handler's availability calendar"""
    availability = await db.handler_availability.find_one({"handler_id": handler_id})
    
    if not availability:
        return {"handler_id": handler_id, "availability_slots": []}
    
    return {
        "handler_id": handler_id,
        "availability_slots": availability.get("availability_slots", []),
        "updated_at": availability.get("updated_at")
    }

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
        {"category": "Cleaning", "name": "Carpet Cleaning", "description": "Handler carpet steam cleaning", "fixed_price": 120.0, "estimated_duration": 90},
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
    total_handlers = await db.users.count_documents({"user_type": "handler"})
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
            "total_handlers": total_handlers,
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



# ==================== Handler Features ====================

class HandlerProfileUpdate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    years_experience: Optional[int] = None
    certifications: Optional[List[str]] = None
    service_area: Optional[List[str]] = None
    profile_image_url: Optional[str] = None

class AvailabilitySlot(BaseModel):
    day_of_week: int  # 0-6 (Monday-Sunday)
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    is_available: bool = True

class ReviewModel(BaseModel):
    booking_id: str
    customer_id: str
    handler_id: str
    rating: int  # 1-5
    comment: Optional[str] = None
    service_quality: int = 5
    handlerism: int = 5
    timeliness: int = 5

# Handler Profile Management
@api_router.get("/handlers/{handler_id}/profile")
async def get_handler_profile(handler_id: str):
    """Get handler's complete profile"""
    if not ObjectId.is_valid(handler_id):
        raise HTTPException(status_code=400, detail="Invalid handler ID")
    
    handler = await db.users.find_one({
        "_id": ObjectId(handler_id),
        "user_type": "handler"
    })
    
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    # Get statistics
    total_bookings = await db.bookings.count_documents({"handler_id": handler_id})
    completed_bookings = await db.bookings.count_documents({
        "handler_id": handler_id,
        "status": "completed"
    })
    
    # Calculate average rating
    reviews = await db.reviews.find({"handler_id": handler_id}).to_list(None)
    avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews) if reviews else 0
    
    # Get availability
    availability = await db.availability.find_one({"handler_id": handler_id})
    
    profile = {
        "id": str(handler["_id"]),
        "name": handler.get("name"),
        "email": handler.get("email"),
        "bio": handler.get("bio", ""),
        "skills": handler.get("skills", []),
        "hourly_rate": handler.get("hourly_rate", 0),
        "years_experience": handler.get("years_experience", 0),
        "certifications": handler.get("certifications", []),
        "service_area": handler.get("service_area", []),
        "profile_image_url": handler.get("profile_image_url"),
        "rating": round(avg_rating, 2),
        "review_count": len(reviews),
        "total_jobs": total_bookings,
        "completed_jobs": completed_bookings,
        "availability": availability.get("slots", []) if availability else [],
        "joined_date": handler.get("created_at"),
    }
    
    return profile

@api_router.put("/handlers/{handler_id}/profile")
async def update_handler_profile(handler_id: str, update: HandlerProfileUpdate):
    """Update handler profile"""
    if not ObjectId.is_valid(handler_id):
        raise HTTPException(status_code=400, detail="Invalid handler ID")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.users.update_one(
        {"_id": ObjectId(handler_id), "user_type": "handler"},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    return {"message": "Profile updated successfully"}

# Job Management
@api_router.get("/handlers/{handler_id}/jobs")
async def get_handler_jobs(
    handler_id: str,
    status: Optional[str] = None,
    limit: int = 50
):
    """Get all jobs for a handler with optional status filter"""
    query = {"handler_id": handler_id}
    
    if status:
        query["status"] = status
    
    jobs = []
    async for booking in db.bookings.find(query).sort("scheduled_time", -1).limit(limit):
        # Get service details
        service = await db.services.find_one({"_id": ObjectId(booking["service_id"])})
        
        # Get customer details
        customer = await db.users.find_one({"_id": ObjectId(booking["customer_id"])})
        
        job = {
            "id": str(booking["_id"]),
            "service_id": booking["service_id"],
            "service_name": service.get("name") if service else "Unknown",
            "service_price": service.get("fixed_price") if service else 0,
            "customer_name": customer.get("name") if customer else "Unknown",
            "customer_email": customer.get("email") if customer else "Unknown",
            "status": booking["status"],
            "scheduled_time": booking["scheduled_time"],
            "location": booking.get("location", {}),
            "notes": booking.get("notes", ""),
            "created_at": booking.get("created_at"),
        }
        jobs.append(job)
    
    return {"jobs": jobs, "total": len(jobs)}

@api_router.put("/handlers/{handler_id}/jobs/{job_id}/status")
async def update_job_status(handler_id: str, job_id: str, status: str):
    """Update job status"""
    valid_statuses = ["confirmed", "in_progress", "completed", "cancelled"]
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    
    result = await db.bookings.update_one(
        {"_id": ObjectId(job_id), "handler_id": handler_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"message": "Job status updated successfully", "new_status": status}

# Earnings Tracking
@api_router.get("/handlers/{handler_id}/earnings")
async def get_handler_earnings(
    handler_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get earnings summary for a handler"""
    query = {
        "handler_id": handler_id,
        "status": "completed"
    }
    
    # Add date filters if provided
    if start_date or end_date:
        query["scheduled_time"] = {}
        if start_date:
            query["scheduled_time"]["$gte"] = start_date
        if end_date:
            query["scheduled_time"]["$lte"] = end_date
    
    # Get all completed bookings
    completed_bookings = []
    async for booking in db.bookings.find(query):
        service = await db.services.find_one({"_id": ObjectId(booking["service_id"])})
        completed_bookings.append({
            "booking_id": str(booking["_id"]),
            "service_name": service.get("name") if service else "Unknown",
            "amount": service.get("fixed_price", 0) if service else 0,
            "completed_date": booking.get("scheduled_time"),
        })
    
    # Calculate totals
    total_earnings = sum(b["amount"] for b in completed_bookings)
    total_jobs = len(completed_bookings)
    average_per_job = total_earnings / total_jobs if total_jobs > 0 else 0
    
    # Get this month's earnings
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_earnings_cursor = db.bookings.find({
        "handler_id": handler_id,
        "status": "completed",
        "scheduled_time": {"$gte": month_start.isoformat()}
    })
    
    month_earnings = 0
    async for booking in month_earnings_cursor:
        service = await db.services.find_one({"_id": ObjectId(booking["service_id"])})
        if service:
            month_earnings += service.get("fixed_price", 0)
    
    return {
        "total_earnings": total_earnings,
        "total_jobs": total_jobs,
        "average_per_job": round(average_per_job, 2),
        "month_earnings": month_earnings,
        "earnings_history": completed_bookings[-20:],  # Last 20 transactions
    }

# Availability Management
@api_router.get("/handlers/{handler_id}/availability")
async def get_handler_availability(handler_id: str):
    """Get handler's availability schedule"""
    availability = await db.availability.find_one({"handler_id": handler_id})
    
    if not availability:
        # Return default empty availability
        return {"handler_id": handler_id, "slots": []}
    
    availability["id"] = str(availability["_id"])
    del availability["_id"]
    return availability

@api_router.post("/handlers/{handler_id}/availability")
async def set_handler_availability(handler_id: str, slots: List[AvailabilitySlot]):
    """Set handler's availability schedule"""
    # Validate slots
    for slot in slots:
        if not (0 <= slot.day_of_week <= 6):
            raise HTTPException(status_code=400, detail="day_of_week must be between 0-6")
    
    slots_dict = [slot.dict() for slot in slots]
    
    # Upsert availability
    result = await db.availability.update_one(
        {"handler_id": handler_id},
        {"$set": {
            "handler_id": handler_id,
            "slots": slots_dict,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    
    return {"message": "Availability updated successfully", "slots_count": len(slots)}

# Review System
@api_router.post("/reviews")
async def create_review(review: ReviewModel):
    """Create a review for a completed booking"""
    # Verify booking exists and is completed
    if not ObjectId.is_valid(review.booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    booking = await db.bookings.find_one({
        "_id": ObjectId(review.booking_id),
        "customer_id": review.customer_id,
        "handler_id": review.handler_id,
        "status": "completed"
    })
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or not completed")
    
    # Check if review already exists
    existing_review = await db.reviews.find_one({"booking_id": review.booking_id})
    if existing_review:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")
    
    # Validate rating
    if not (1 <= review.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review_dict = review.dict()
    review_dict["created_at"] = datetime.utcnow()
    
    result = await db.reviews.insert_one(review_dict)
    
    # Update handler's overall rating
    await update_handler_rating(review.handler_id)
    
    return {"message": "Review created successfully", "review_id": str(result.inserted_id)}

@api_router.get("/reviews/handler/{handler_id}")
async def get_handler_reviews(handler_id: str, limit: int = 50):
    """Get all reviews for a handler"""
    reviews = []
    async for review in db.reviews.find({"handler_id": handler_id}).sort("created_at", -1).limit(limit):
        # Get customer info
        customer = await db.users.find_one({"_id": ObjectId(review["customer_id"])})
        
        # Get booking/service info
        booking = await db.bookings.find_one({"_id": ObjectId(review["booking_id"])})
        service_name = "Unknown"
        if booking:
            service = await db.services.find_one({"_id": ObjectId(booking["service_id"])})
            if service:
                service_name = service.get("name")
        
        reviews.append({
            "id": str(review["_id"]),
            "rating": review["rating"],
            "comment": review.get("comment", ""),
            "service_quality": review.get("service_quality", 5),
            "handlerism": review.get("handlerism", 5),
            "timeliness": review.get("timeliness", 5),
            "customer_name": customer.get("name") if customer else "Anonymous",
            "service_name": service_name,
            "created_at": review.get("created_at"),
        })
    
    return {"reviews": reviews, "total": len(reviews)}

@api_router.get("/reviews/booking/{booking_id}")
async def get_booking_review(booking_id: str):
    """Get review for a specific booking"""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    review = await db.reviews.find_one({"booking_id": booking_id})
    
    if not review:
        return {"review": None}
    


# ==================== Admin Platform Expansion ====================

class PromoCodeModel(BaseModel):
    code: str
    discount_type: str  # 'percentage' or 'fixed'
    discount_value: float
    max_uses: Optional[int] = None
    expiry_date: Optional[str] = None
    active: bool = True
    applicable_services: Optional[List[str]] = None

class ManualBookingAssignment(BaseModel):
    booking_id: str
    handler_id: str
    admin_notes: Optional[str] = None

class CompanySettings(BaseModel):
    company_name: str
    company_address: str
    company_phone: str
    company_email: str
    support_email: Optional[str] = None
    support_phone: Optional[str] = None

class TermsAndPolicy(BaseModel):
    terms_of_service: str
    privacy_policy: str
    cancellation_policy: Optional[str] = None

class PartnerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    organization_name: str
    license_number: str
    license_document: Optional[str] = None  # Base64 encoded
    phone: str
    address: str
    healthcare_category: str  # "Baby Sitter", "Dog Sitter", "Mental Support", "Domiciliary Care", "Support Worker"

class PartnerResponse(BaseModel):
    id: str
    name: str
    email: str
    organization_name: str
    license_number: str
    phone: str
    address: str
    healthcare_category: str
    status: str  # "pending", "approved", "rejected", "suspended"
    handler_count: int = 0
    created_at: datetime

class PartnerLogin(BaseModel):
    email: EmailStr
    password: str

class HandlerPartnerAssignment(BaseModel):
    handler_id: str
    partner_id: str
    admin_notes: Optional[str] = None

# Stripe Connect Models
class StripeConnectOnboarding(BaseModel):
    handler_id: str
    return_url: str
    refresh_url: str

class StripePayoutRequest(BaseModel):
    handler_id: str
    amount: float  # Amount in GBP
    description: Optional[str] = None
    booking_id: Optional[str] = None

class StripeSettingsUpdate(BaseModel):
    use_live_stripe: bool

# Manual Booking Assignment
@api_router.post("/admin/bookings/{booking_id}/assign")
async def admin_assign_booking(booking_id: str, assignment: ManualBookingAssignment):
    """Manually assign a booking to a handler"""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    if not ObjectId.is_valid(assignment.handler_id):
        raise HTTPException(status_code=400, detail="Invalid handler ID")
    
    # Check if booking exists
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if handler exists and is available
    handler = await db.users.find_one({"_id": ObjectId(assignment.handler_id), "user_type": "handler"})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    # Update booking with handler assignment
    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {
            "handler_id": assignment.handler_id,
            "status": "accepted",
            "manually_assigned": True,
            "admin_notes": assignment.admin_notes,
            "assigned_at": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Booking assigned successfully",
        "booking_id": booking_id,
        "handler_id": assignment.handler_id
    }

# Company Settings Management
@api_router.get("/settings/company")
async def get_company_settings():
    """Get company settings"""
    settings = await db.company_settings.find_one({"type": "company"})
    
    if not settings:
        # Return default settings
        return {
            "company_name": "ExperTrait",
            "company_address": "123 Main St, London, UK",
            "company_phone": "+44 20 1234 5678",
            "company_email": "info@expertrait.com",
            "support_email": "support@expertrait.com",
            "support_phone": "+44 20 1234 5679"
        }
    
    return serialize_doc(settings)

@api_router.put("/admin/settings/company")
async def update_company_settings(settings: CompanySettings):
    """Update company settings"""
    settings_dict = settings.dict()
    settings_dict["type"] = "company"
    settings_dict["updated_at"] = datetime.utcnow()
    
    await db.company_settings.update_one(
        {"type": "company"},
        {"$set": settings_dict},
        upsert=True
    )
    
    return {"message": "Company settings updated successfully", "settings": settings_dict}

# Terms and Policy Management
@api_router.get("/settings/terms-policy")
async def get_terms_and_policy():
    """Get terms of service and privacy policy"""
    terms_policy = await db.terms_policy.find_one({"type": "terms_policy"})
    
    if not terms_policy:
        # Return default
        return {
            "terms_of_service": "Default Terms of Service",
            "privacy_policy": "Default Privacy Policy",
            "cancellation_policy": "Default Cancellation Policy"
        }
    
    return serialize_doc(terms_policy)

@api_router.put("/admin/settings/terms-policy")
async def update_terms_and_policy(terms_policy: TermsAndPolicy):
    """Update terms of service and privacy policy"""
    terms_dict = terms_policy.dict()
    terms_dict["type"] = "terms_policy"
    terms_dict["updated_at"] = datetime.utcnow()
    
    await db.terms_policy.update_one(
        {"type": "terms_policy"},
        {"$set": terms_dict},
        upsert=True
    )
    
    return {"message": "Terms and policy updated successfully"}

# Delete Account
@api_router.delete("/user/{user_id}/account")
async def delete_user_account(user_id: str, password: str):
    """Delete user account - requires password confirmation"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify password
    import bcrypt
    if not bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Check for active bookings
    active_bookings = await db.bookings.count_documents({
        "$or": [
            {"customer_id": user_id, "status": {"$in": ["pending", "accepted", "in_progress"]}},
            {"handler_id": user_id, "status": {"$in": ["accepted", "in_progress"]}}
        ]
    })
    
    if active_bookings > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete account with active bookings. Please complete or cancel them first."
        )
    
    # Anonymize user data instead of hard delete
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "name": "Deleted User",
            "email": f"deleted_{user_id}@deleted.com",
            "password": "",
            "phone": "",
            "status": "deleted",
            "deleted_at": datetime.utcnow()
        }}
    )
    
    # Anonymize related data
    await db.bookings.update_many(
        {"customer_id": user_id},
        {"$set": {"customer_anonymized": True}}
    )
    
    await db.bookings.update_many(
        {"handler_id": user_id},
        {"$set": {"handler_anonymized": True}}
    )
    
    return {"message": "Account deleted successfully"}

# User Management
@api_router.get("/admin/users")
async def admin_get_users(
    user_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
):
    """Get all users with optional filters"""
    query = {}
    
    if user_type:
        query["user_type"] = user_type
    
    if status:
        query["status"] = status
    
    users = []
    async for user in db.users.find(query).limit(limit):
        # Get additional stats
        if user.get("user_type") == "handler":
            total_jobs = await db.bookings.count_documents({"handler_id": str(user["_id"])})
            reviews = await db.reviews.find({"handler_id": str(user["_id"])}).to_list(None)
            avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews) if reviews else 0
        else:
            total_jobs = await db.bookings.count_documents({"customer_id": str(user["_id"])})
            avg_rating = 0
        
        users.append({
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "user_type": user.get("user_type"),
            "status": user.get("status", "active"),
            "created_at": user.get("created_at"),
            "total_jobs": total_jobs,
            "rating": round(avg_rating, 2) if avg_rating else None,
        })
    
    return {"users": users, "total": len(users)}

@api_router.get("/admin/users/{user_id}")
async def admin_get_user(user_id: str):
    """Get detailed user information"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get bookings
    bookings = await db.bookings.find({
        "$or": [
            {"customer_id": user_id},
            {"handler_id": user_id}
        ]
    }).to_list(20)
    
    # Get reviews if handler
    reviews = []
    if user.get("user_type") == "handler":
        reviews = await db.reviews.find({"handler_id": user_id}).to_list(10)
    
    user_detail = {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "user_type": user.get("user_type"),
        "status": user.get("status", "active"),
        "created_at": user.get("created_at"),
        "bio": user.get("bio"),
        "skills": user.get("skills", []),
        "rating": user.get("rating"),
        "recent_bookings": len(bookings),
        "review_count": len(reviews),
    }
    
    return user_detail

@api_router.put("/admin/users/{user_id}/status")
async def admin_update_user_status(user_id: str, status: str):
    """Update user status (active, suspended, banned)"""
    valid_statuses = ["active", "suspended", "banned"]
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User status updated successfully", "new_status": status}

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str):
    """Delete a user (soft delete by setting status to deleted)"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Check for active bookings
    active_bookings = await db.bookings.count_documents({
        "$or": [
            {"customer_id": user_id, "status": {"$in": ["pending", "confirmed", "in_progress"]}},
            {"handler_id": user_id, "status": {"$in": ["pending", "confirmed", "in_progress"]}}
        ]
    })
    
    if active_bookings > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete user with {active_bookings} active bookings"
        )
    
    # Soft delete
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": "deleted", "deleted_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

# Booking Management
@api_router.get("/admin/bookings")
async def admin_get_bookings(
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """Get all bookings with filters"""
    query = {}
    
    if status:
        query["status"] = status
    
    if start_date or end_date:
        query["scheduled_time"] = {}
        if start_date:
            query["scheduled_time"]["$gte"] = start_date
        if end_date:
            query["scheduled_time"]["$lte"] = end_date
    
    bookings = []
    async for booking in db.bookings.find(query).sort("created_at", -1).limit(limit):
        # Get service, customer, and handler info
        service = await db.services.find_one({"_id": ObjectId(booking["service_id"])})
        customer = await db.users.find_one({"_id": ObjectId(booking["customer_id"])})
        handler = await db.users.find_one({"_id": ObjectId(booking.get("handler_id", "000000000000000000000000"))})
        
        bookings.append({
            "id": str(booking["_id"]),
            "service_name": service.get("name") if service else "Unknown",
            "service_price": service.get("fixed_price") if service else 0,
            "customer_name": customer.get("name") if customer else "Unknown",
            "handler_name": handler.get("name") if handler else "Unassigned",
            "status": booking["status"],
            "scheduled_time": booking["scheduled_time"],
            "created_at": booking.get("created_at"),
        })
    
    return {"bookings": bookings, "total": len(bookings)}

@api_router.put("/admin/bookings/{booking_id}/status")
async def admin_update_booking_status(booking_id: str, status: str):
    """Admin override booking status"""
    valid_statuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"]
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status")
    
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    result = await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking status updated", "new_status": status}

@api_router.delete("/admin/bookings/{booking_id}")
async def admin_delete_booking(booking_id: str):
    """Delete a booking"""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    result = await db.bookings.delete_one({"_id": ObjectId(booking_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking deleted successfully"}

# Analytics
@api_router.get("/admin/analytics")
async def get_admin_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get comprehensive platform analytics"""
    # Date range for bookings
    booking_query = {}
    if start_date or end_date:
        booking_query["created_at"] = {}
        if start_date:
            booking_query["created_at"]["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            booking_query["created_at"]["$lte"] = datetime.fromisoformat(end_date)
    
    # Booking statistics
    total_bookings = await db.bookings.count_documents(booking_query)
    pending = await db.bookings.count_documents({**booking_query, "status": "pending"})
    confirmed = await db.bookings.count_documents({**booking_query, "status": "confirmed"})
    in_progress = await db.bookings.count_documents({**booking_query, "status": "in_progress"})
    completed = await db.bookings.count_documents({**booking_query, "status": "completed"})
    cancelled = await db.bookings.count_documents({**booking_query, "status": "cancelled"})
    
    # Revenue calculation
    revenue_pipeline = [
        {"$match": {**booking_query, "status": "completed"}},
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
        "bookings": {
            "total": total_bookings,
            "pending": pending,
            "confirmed": confirmed,
            "in_progress": in_progress,
            "completed": completed,
            "cancelled": cancelled,
        },
        "revenue": {
            "total": total_revenue,
            "average_per_booking": total_revenue / completed if completed > 0 else 0,
        }
    }

# ==================== Chat System ====================

class ChatMessage(BaseModel):
    sender_id: str
    sender_type: str  # 'customer', 'handler', 'admin'
    receiver_id: Optional[str] = None  # None for admin chats
    booking_id: Optional[str] = None  # For user-handler chats
    message: str
    message_type: str = "text"  # 'text', 'image', 'file'

class SupportTicket(BaseModel):
    user_id: str
    subject: str
    message: str
    priority: str = "normal"  # 'low', 'normal', 'high', 'urgent'

# User-Handler Chat (Booking-specific)
@api_router.post("/chat/booking/{booking_id}/message")
async def send_booking_message(booking_id: str, message: ChatMessage):
    """Send message in booking chat"""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    # Verify booking exists and user is authorized
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check authorization
    if message.sender_id not in [booking["customer_id"], booking.get("handler_id", "")]:
        raise HTTPException(status_code=403, detail="Not authorized for this chat")
    
    message_dict = message.dict()
    message_dict["booking_id"] = booking_id
    message_dict["created_at"] = datetime.utcnow()
    message_dict["read"] = False
    
    result = await db.chat_messages.insert_one(message_dict)
    
    # Notify via WebSocket
    await manager.send_message(
        message.receiver_id if message.receiver_id else booking["customer_id"],
        {
            "type": "new_message",
            "message": message_dict,
            "message_id": str(result.inserted_id)
        }
    )
    
    return {"message": "Message sent", "message_id": str(result.inserted_id)}

@api_router.get("/chat/booking/{booking_id}/messages")
async def get_booking_messages(booking_id: str, user_id: str, limit: int = 50):
    """Get all messages for a booking"""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    # Verify authorization
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id not in [booking["customer_id"], booking.get("handler_id", "")]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = []
    async for msg in db.chat_messages.find({"booking_id": booking_id}).sort("created_at", 1).limit(limit):
        msg["id"] = str(msg["_id"])
        del msg["_id"]
        messages.append(msg)
    
    # Mark messages as read
    await db.chat_messages.update_many(
        {"booking_id": booking_id, "receiver_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return {"messages": messages, "total": len(messages)}

# User-Admin Support Chat
@api_router.post("/support/ticket")
async def create_support_ticket(ticket: SupportTicket):
    """Create a new support ticket"""
    ticket_dict = ticket.dict()
    ticket_dict["status"] = "open"  # open, in_progress, resolved, closed
    ticket_dict["created_at"] = datetime.utcnow()
    ticket_dict["updated_at"] = datetime.utcnow()
    
    result = await db.support_tickets.insert_one(ticket_dict)
    
    # Create initial message
    initial_message = {
        "ticket_id": str(result.inserted_id),
        "sender_id": ticket.user_id,
        "sender_type": "customer",
        "message": ticket.message,
        "created_at": datetime.utcnow(),
        "read": False
    }
    await db.support_messages.insert_one(initial_message)
    
    return {"message": "Support ticket created", "ticket_id": str(result.inserted_id)}

@api_router.post("/support/ticket/{ticket_id}/message")
async def send_support_message(ticket_id: str, message: ChatMessage):
    """Send message in support ticket"""
    if not ObjectId.is_valid(ticket_id):
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    
    # Verify ticket exists
    ticket = await db.support_tickets.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    message_dict = message.dict()
    message_dict["ticket_id"] = ticket_id
    message_dict["created_at"] = datetime.utcnow()
    message_dict["read"] = False
    
    result = await db.support_messages.insert_one(message_dict)
    
    # Update ticket
    await db.support_tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"updated_at": datetime.utcnow(), "status": "in_progress"}}
    )
    
    return {"message": "Message sent", "message_id": str(result.inserted_id)}

@api_router.get("/support/tickets/user/{user_id}")
async def get_user_tickets(user_id: str):
    """Get all support tickets for a user"""
    tickets = []
    async for ticket in db.support_tickets.find({"user_id": user_id}).sort("created_at", -1):
        # Get message count
        msg_count = await db.support_messages.count_documents({"ticket_id": str(ticket["_id"])})
        
        ticket["id"] = str(ticket["_id"])
        del ticket["_id"]
        ticket["message_count"] = msg_count
        tickets.append(ticket)
    
    return {"tickets": tickets, "total": len(tickets)}

@api_router.get("/support/ticket/{ticket_id}/messages")
async def get_support_messages(ticket_id: str, limit: int = 100):
    """Get all messages in a support ticket"""
    if not ObjectId.is_valid(ticket_id):
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    
    messages = []
    async for msg in db.support_messages.find({"ticket_id": ticket_id}).sort("created_at", 1).limit(limit):
        msg["id"] = str(msg["_id"])
        del msg["_id"]
        messages.append(msg)
    
    return {"messages": messages, "total": len(messages)}

# Admin Chat Management
@api_router.get("/admin/support/tickets")
async def get_all_support_tickets(status: Optional[str] = None, limit: int = 100):
    """Get all support tickets (admin)"""
    query = {}
    if status:
        query["status"] = status
    
    tickets = []
    async for ticket in db.support_tickets.find(query).sort("updated_at", -1).limit(limit):
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(ticket["user_id"])})
        
        # Get message count
        msg_count = await db.support_messages.count_documents({"ticket_id": str(ticket["_id"])})
        
        ticket["id"] = str(ticket["_id"])
        del ticket["_id"]
        ticket["user_name"] = user.get("name") if user else "Unknown"
        ticket["user_email"] = user.get("email") if user else "Unknown"
        ticket["message_count"] = msg_count
        tickets.append(ticket)
    
    return {"tickets": tickets, "total": len(tickets)}

@api_router.put("/admin/support/ticket/{ticket_id}/status")
async def update_ticket_status(ticket_id: str, status: str):
    """Update support ticket status"""
    valid_statuses = ["open", "in_progress", "resolved", "closed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    if not ObjectId.is_valid(ticket_id):
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    
    result = await db.support_tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return {"message": "Status updated", "new_status": status}

@api_router.get("/admin/chat/all-conversations")
async def get_all_conversations(limit: int = 50):
    """Get all booking conversations (admin monitoring)"""
    # Get unique booking IDs with messages
    pipeline = [
        {"$group": {"_id": "$booking_id", "last_message": {"$max": "$created_at"}}},
        {"$sort": {"last_message": -1}},
        {"$limit": limit}
    ]
    
    booking_ids = await db.chat_messages.aggregate(pipeline).to_list(limit)
    
    conversations = []
    for item in booking_ids:
        booking_id = item["_id"]
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        
        if booking:
            # Get customer and handler info
            customer = await db.users.find_one({"_id": ObjectId(booking["customer_id"])})
            handler = await db.users.find_one({"_id": ObjectId(booking.get("handler_id", "000000000000000000000000"))})
            
            # Get service info
            service = await db.services.find_one({"_id": ObjectId(booking["service_id"])})
            
            # Get message count
            msg_count = await db.chat_messages.count_documents({"booking_id": booking_id})
            
            conversations.append({
                "booking_id": booking_id,
                "customer_name": customer.get("name") if customer else "Unknown",
                "handler_name": handler.get("name") if handler else "Unassigned",
                "service_name": service.get("name") if service else "Unknown",
                "message_count": msg_count,
                "last_message": item["last_message"],
                "booking_status": booking["status"]
            })
    
    return {"conversations": conversations, "total": len(conversations)}

# Handler Profile for Customer
@api_router.get("/bookings/{booking_id}/handler-profile")
async def get_booking_handler_profile(booking_id: str):
    """Get handler profile for a specific booking"""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    handler_id = booking.get("handler_id")
    if not handler_id:
        return {"handler": None, "message": "No handler assigned yet"}
    
    # Get handler profile
    handler = await db.users.find_one({"_id": ObjectId(handler_id), "user_type": "handler"})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    # Get handler stats
    total_jobs = await db.bookings.count_documents({"handler_id": handler_id, "status": "completed"})
    reviews = await db.reviews.find({"handler_id": handler_id}).to_list(None)
    avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews) if reviews else 0
    
    handler_profile = {
        "id": str(handler["_id"]),
        "name": handler.get("name"),
        "email": handler.get("email"),
        "profile_image_url": handler.get("profile_image_url"),
        "bio": handler.get("bio", ""),
        "skills": handler.get("skills", []),
        "hourly_rate": handler.get("hourly_rate", 0),
        "years_experience": handler.get("years_experience", 0),
        "rating": round(avg_rating, 2),
        "review_count": len(reviews),
        "completed_jobs": total_jobs,
    }
    
    return {"handler": handler_profile}

# Promo Code System  
@api_router.post("/admin/promo-codes")
async def create_promo_code(promo: PromoCodeModel):
    """Create a new promo code"""
    # Check if code already exists
    existing = await db.promo_codes.find_one({"code": promo.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Promo code already exists")
    
    promo_dict = promo.dict()
    promo_dict["code"] = promo_dict["code"].upper()
    promo_dict["uses_count"] = 0
    promo_dict["created_at"] = datetime.utcnow()
    
    result = await db.promo_codes.insert_one(promo_dict)
    
    return {"message": "Promo code created successfully", "code": promo.code.upper()}

@api_router.get("/admin/promo-codes")
async def get_all_promo_codes():
    """Get all promo codes"""
    promo_codes = []
    async for promo in db.promo_codes.find().sort("created_at", -1):
        promo["id"] = str(promo["_id"])
        del promo["_id"]
        promo_codes.append(promo)
    
    return {"promo_codes": promo_codes, "total": len(promo_codes)}

@api_router.get("/promo-codes/{code}")
async def validate_promo_code(code: str):
    """Validate a promo code"""
    promo = await db.promo_codes.find_one({"code": code.upper(), "active": True})
    
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid or inactive promo code")
    
    # Check expiry
    if promo.get("expiry_date"):
        expiry = datetime.fromisoformat(promo["expiry_date"])
        if datetime.utcnow() > expiry:
            raise HTTPException(status_code=400, detail="Promo code has expired")
    
    # Check max uses
    if promo.get("max_uses"):
        if promo.get("uses_count", 0) >= promo["max_uses"]:
            raise HTTPException(status_code=400, detail="Promo code usage limit reached")
    
    return {
        "valid": True,
        "discount_type": promo["discount_type"],
        "discount_value": promo["discount_value"],
    }

@api_router.put("/admin/promo-codes/{code}/deactivate")
async def deactivate_promo_code(code: str):
    """Deactivate a promo code"""
    result = await db.promo_codes.update_one(
        {"code": code.upper()},
        {"$set": {"active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Promo code not found")
    
    return {"message": "Promo code deactivated"}

@api_router.delete("/admin/promo-codes/{code}")
async def delete_promo_code(code: str):
    """Delete a promo code"""
    result = await db.promo_codes.delete_one({"code": code.upper()})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promo code not found")
    
    return {"message": "Promo code deleted"}

    review["id"] = str(review["_id"])
    del review["_id"]
    return {"review": review}

async def update_handler_rating(handler_id: str):
    """Helper function to update handler's average rating"""
    reviews = await db.reviews.find({"handler_id": handler_id}).to_list(None)
    
    if reviews:
        avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews)
        await db.users.update_one(
            {"_id": ObjectId(handler_id)},
            {"$set": {"rating": round(avg_rating, 2), "review_count": len(reviews)}}
        )


# Root routes
@api_router.get("/")
async def root():
    return {"message": "ExperTrait Home Services API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
# ==================== Partner System Routes ====================

HEALTHCARE_CATEGORIES = [
    "Baby Sitter",
    "Dog Sitter", 
    "Mental Support Worker",
    "Domiciliary Care Worker",
    "Support Worker (Sit-in)"
]

@api_router.post("/partner/register")
async def register_partner(partner: PartnerCreate):
    """Register a new healthcare partner"""
    # Check if partner email already exists
    existing = await db.partners.find_one({"email": partner.email})
    if existing:
        raise HTTPException(status_code=400, detail="Partner with this email already exists")
    
    # Validate healthcare category
    if partner.healthcare_category not in HEALTHCARE_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid healthcare category. Must be one of: {', '.join(HEALTHCARE_CATEGORIES)}"
        )
    
    # Hash password
    import bcrypt
    hashed_password = bcrypt.hashpw(partner.password.encode('utf-8'), bcrypt.gensalt())
    
    partner_dict = partner.dict()
    partner_dict["password"] = hashed_password.decode('utf-8')
    partner_dict["status"] = "pending"  # Pending admin approval
    partner_dict["handler_count"] = 0
    partner_dict["created_at"] = datetime.utcnow()
    
    result = await db.partners.insert_one(partner_dict)
    
    # Notify admin of new partner registration
    await send_admin_alert_email(
        subject="🏥 New Partner Registration - ExperTrait",
        body=f"""
        A new healthcare partner has registered:
        
        Organization: {partner.organization_name}
        Contact: {partner.name}
        Email: {partner.email}
        Category: {partner.healthcare_category}
        License: {partner.license_number}
        
        Please review and approve/reject from the admin dashboard.
        Partner ID: {str(result.inserted_id)}
        """
    )
    
    return {
        "message": "Partner registration submitted. Pending admin approval.",
        "partner_id": str(result.inserted_id),
        "status": "pending"
    }

@api_router.post("/partner/login")
async def partner_login(login: PartnerLogin):
    """Partner login"""
    partner = await db.partners.find_one({"email": login.email})
    if not partner:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    import bcrypt
    if not bcrypt.checkpw(login.password.encode('utf-8'), partner["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if approved
    if partner.get("status") != "approved":
        raise HTTPException(
            status_code=403,
            detail=f"Partner account is {partner.get('status', 'pending')}. Please wait for admin approval."
        )
    
    return PartnerResponse(**serialize_doc(partner))

@api_router.get("/partner/{partner_id}/handlers")
async def get_partner_handlers(partner_id: str):
    """Get all handlers assigned to this partner"""
    if not ObjectId.is_valid(partner_id):
        raise HTTPException(status_code=400, detail="Invalid partner ID")
    
    # Get handlers assigned to this partner
    handlers = await db.users.find({
        "user_type": "handler",
        "partner_id": partner_id,
        "skills": {"$in": HEALTHCARE_CATEGORIES}
    }).to_list(100)
    
    handler_list = []
    for handler in handlers:
        # Get handler stats
        total_jobs = await db.bookings.count_documents({"handler_id": str(handler["_id"])})
        
        handler_list.append({
            "id": str(handler["_id"]),
            "name": handler.get("name"),
            "email": handler.get("email"),
            "phone": handler.get("phone"),
            "skills": handler.get("skills", []),
            "status": handler.get("status", "pending"),
            "total_jobs": total_jobs,
            "created_at": handler.get("created_at")
        })
    
    return {"handlers": handler_list, "total": len(handler_list)}

@api_router.get("/partner/{partner_id}/bookings")
async def get_partner_bookings(partner_id: str):
    """Get all bookings for handlers under this partner"""
    if not ObjectId.is_valid(partner_id):
        raise HTTPException(status_code=400, detail="Invalid partner ID")
    
    # Get all handlers under this partner
    handlers = await db.users.find({
        "partner_id": partner_id,
        "user_type": "handler"
    }).to_list(100)
    
    handler_ids = [str(h["_id"]) for h in handlers]
    
    # Get bookings for these handlers
    bookings = await db.bookings.find({
        "handler_id": {"$in": handler_ids},
        "service_category": {"$in": HEALTHCARE_CATEGORIES}
    }).sort("created_at", -1).to_list(100)
    
    return {
        "bookings": [serialize_doc(b) for b in bookings],
        "total": len(bookings)
    }

@api_router.put("/admin/partners/{partner_id}/status")
async def admin_update_partner_status(partner_id: str, status: str):
    """Admin approves/rejects partner application"""
    if status not in ["approved", "rejected", "suspended"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    if not ObjectId.is_valid(partner_id):
        raise HTTPException(status_code=400, detail="Invalid partner ID")
    
    partner = await db.partners.find_one({"_id": ObjectId(partner_id)})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    await db.partners.update_one(
        {"_id": ObjectId(partner_id)},
        {"$set": {"status": status, "status_updated_at": datetime.utcnow()}}
    )
    
    # Send email to partner
    partner_email = partner.get("email")
    if status == "approved":
        subject = "✅ Partner Application Approved - ExperTrait"
        body = f"""
        <h2>Congratulations!</h2>
        <p>Your partner application has been approved.</p>
        <p>Organization: {partner.get('organization_name')}</p>
        <p>You can now login to your partner dashboard and start managing healthcare workers.</p>
        """
    else:
        subject = "Partner Application Update - ExperTrait"
        body = f"""
        <h2>Application Status Update</h2>
        <p>Your partner application status: {status.upper()}</p>
        <p>Organization: {partner.get('organization_name')}</p>
        """
    
    await send_verification_email(partner_email, subject, body)
    
    return {"message": f"Partner status updated to {status}"}

@api_router.post("/admin/handlers/{handler_id}/assign-partner")
async def admin_assign_handler_to_partner(handler_id: str, assignment: HandlerPartnerAssignment):
    """Admin assigns a healthcare handler to a partner"""
    if not ObjectId.is_valid(handler_id) or not ObjectId.is_valid(assignment.partner_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    handler = await db.users.find_one({"_id": ObjectId(handler_id), "user_type": "handler"})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    partner = await db.partners.find_one({"_id": ObjectId(assignment.partner_id)})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # Check if handler has healthcare skills
    handler_skills = handler.get("skills", [])
    is_healthcare = any(skill in HEALTHCARE_CATEGORIES for skill in handler_skills)
    
    if not is_healthcare:
        raise HTTPException(
            status_code=400,
            detail="Handler must have healthcare category skills to be assigned to a partner"
        )
    
    # Assign handler to partner
    await db.users.update_one(
        {"_id": ObjectId(handler_id)},
        {"$set": {
            "partner_id": assignment.partner_id,
            "partner_assignment_notes": assignment.admin_notes,
            "partner_assigned_at": datetime.utcnow()
        }}
    )
    
    # Update partner handler count
    await db.partners.update_one(
        {"_id": ObjectId(assignment.partner_id)},
        {"$inc": {"handler_count": 1}}
    )
    
    # Notify partner
    partner_email = partner.get("email")
    await send_verification_email(
        partner_email,
        "New Handler Assigned - ExperTrait",
        f"""
        <h2>New Handler Assigned</h2>
        <p>A new healthcare worker has been assigned to your organization:</p>
        <ul>
            <li>Name: {handler.get('name')}</li>
            <li>Email: {handler.get('email')}</li>
            <li>Skills: {', '.join(handler_skills)}</li>
        </ul>
        <p>You can now supervise this handler from your partner dashboard.</p>
        """
    )
    
    # Notify handler
    handler_email = handler.get("email")
    await send_verification_email(
        handler_email,
        "Assigned to Healthcare Partner - ExperTrait",
        f"""
        <h2>Partner Assignment</h2>
        <p>You have been assigned to a healthcare partner organization:</p>
        <p>Organization: {partner.get('organization_name')}</p>
        <p>This partner will supervise your healthcare-related bookings.</p>
        """
    )
    
    return {
        "message": "Handler assigned to partner successfully",
        "handler_id": handler_id,
        "partner_id": assignment.partner_id
    }

@api_router.get("/admin/partners")
async def admin_get_partners(status: Optional[str] = None):
    """Admin gets all partners"""
    query = {}
    if status:
        query["status"] = status
    
    partners = await db.partners.find(query).sort("created_at", -1).to_list(100)
    
    partner_list = []
    for partner in partners:
        partner_list.append(PartnerResponse(**serialize_doc(partner)))
    
    return {"partners": partner_list, "total": len(partner_list)}

# ==================== Stripe Connect Routes ====================

@api_router.post("/stripe/connect/onboard")
async def stripe_connect_onboard(request: StripeConnectOnboarding):
    """Start Stripe Connect onboarding for a handler"""
    if not ObjectId.is_valid(request.handler_id):
        raise HTTPException(status_code=400, detail="Invalid handler ID")
    
    handler = await db.users.find_one({"_id": ObjectId(request.handler_id), "user_type": "handler"})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    try:
        # Get active Stripe key
        secret_key, _ = await get_stripe_key()
        stripe.api_key = secret_key
        
        # Check if handler already has a Stripe account
        stripe_account_id = handler.get("stripe_account_id")
        
        if not stripe_account_id:
            # Create new Connected Account
            account = stripe.Account.create(
                type="express",
                country="GB",  # United Kingdom
                email=handler.get("email"),
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                },
                business_type="individual",
                metadata={
                    "handler_id": request.handler_id,
                    "handler_name": handler.get("name")
                }
            )
            
            stripe_account_id = account.id
            
            # Save Stripe account ID to handler
            await db.users.update_one(
                {"_id": ObjectId(request.handler_id)},
                {"$set": {
                    "stripe_account_id": stripe_account_id,
                    "stripe_onboarding_started_at": datetime.utcnow()
                }}
            )
        
        # Create Account Link for onboarding
        account_link = stripe.AccountLink.create(
            account=stripe_account_id,
            refresh_url=request.refresh_url,
            return_url=request.return_url,
            type="account_onboarding",
        )
        
        return {
            "onboarding_url": account_link.url,
            "stripe_account_id": stripe_account_id,
            "expires_at": account_link.expires_at
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

@api_router.get("/stripe/connect/status/{handler_id}")
async def stripe_connect_status(handler_id: str):
    """Get Stripe Connect account status for a handler"""
    if not ObjectId.is_valid(handler_id):
        raise HTTPException(status_code=400, detail="Invalid handler ID")
    
    handler = await db.users.find_one({"_id": ObjectId(handler_id), "user_type": "handler"})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    stripe_account_id = handler.get("stripe_account_id")
    if not stripe_account_id:
        return {
            "connected": False,
            "details_submitted": False,
            "charges_enabled": False,
            "payouts_enabled": False
        }
    
    try:
        # Get active Stripe key
        secret_key, _ = await get_stripe_key()
        stripe.api_key = secret_key
        
        # Retrieve account from Stripe
        account = stripe.Account.retrieve(stripe_account_id)
        
        return {
            "connected": True,
            "stripe_account_id": stripe_account_id,
            "details_submitted": account.details_submitted,
            "charges_enabled": account.charges_enabled,
            "payouts_enabled": account.payouts_enabled,
            "requirements": {
                "currently_due": account.requirements.currently_due,
                "eventually_due": account.requirements.eventually_due,
                "past_due": account.requirements.past_due,
            }
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

@api_router.post("/stripe/payout")
async def create_payout(request: StripePayoutRequest):
    """Create a payout to a handler's Stripe Connected Account"""
    if not ObjectId.is_valid(request.handler_id):
        raise HTTPException(status_code=400, detail="Invalid handler ID")
    
    handler = await db.users.find_one({"_id": ObjectId(request.handler_id), "user_type": "handler"})
    if not handler:
        raise HTTPException(status_code=404, detail="Handler not found")
    
    stripe_account_id = handler.get("stripe_account_id")
    if not stripe_account_id:
        raise HTTPException(status_code=400, detail="Handler has not completed Stripe Connect onboarding")
    
    try:
        # Get active Stripe key
        secret_key, _ = await get_stripe_key()
        stripe.api_key = secret_key
        
        # Verify account is active
        account = stripe.Account.retrieve(stripe_account_id)
        if not account.payouts_enabled:
            raise HTTPException(status_code=400, detail="Handler's Stripe account is not enabled for payouts")
        
        # Convert amount to pence (Stripe uses smallest currency unit)
        amount_pence = int(request.amount * 100)
        
        # Create transfer to Connected Account
        transfer = stripe.Transfer.create(
            amount=amount_pence,
            currency="gbp",
            destination=stripe_account_id,
            description=request.description or f"Payout to {handler.get('name')}",
            metadata={
                "handler_id": request.handler_id,
                "handler_name": handler.get("name"),
                "booking_id": request.booking_id or "manual_payout"
            }
        )
        
        # Record payout in database
        payout_record = {
            "handler_id": request.handler_id,
            "stripe_account_id": stripe_account_id,
            "stripe_transfer_id": transfer.id,
            "amount": request.amount,
            "currency": "GBP",
            "description": request.description,
            "booking_id": request.booking_id,
            "status": "completed",
            "created_at": datetime.utcnow()
        }
        
        await db.payouts.insert_one(payout_record)
        
        # Update handler wallet
        await db.users.update_one(
            {"_id": ObjectId(request.handler_id)},
            {
                "$inc": {"total_earnings": request.amount, "total_payouts": request.amount},
                "$set": {"last_payout_at": datetime.utcnow()}
            }
        )
        
        return {
            "success": True,
            "transfer_id": transfer.id,
            "amount": request.amount,
            "currency": "GBP",
            "handler_name": handler.get("name"),
            "created_at": datetime.utcnow().isoformat()
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

@api_router.get("/stripe/payouts/{handler_id}")
async def get_handler_payouts(handler_id: str, limit: int = 50):
    """Get payout history for a handler"""
    if not ObjectId.is_valid(handler_id):
        raise HTTPException(status_code=400, detail="Invalid handler ID")
    
    payouts = await db.payouts.find({"handler_id": handler_id}).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {
        "payouts": [serialize_doc(p) for p in payouts],
        "total": len(payouts)
    }

@api_router.get("/admin/stripe/settings")
async def get_stripe_settings():
    """Get Stripe settings (test/live mode)"""
    settings = await db.company_settings.find_one()
    if not settings:
        return {
            "use_live_stripe": False,
            "test_mode": True,
            "has_test_keys": bool(STRIPE_TEST_SECRET_KEY),
            "has_live_keys": bool(STRIPE_LIVE_SECRET_KEY)
        }
    
    return {
        "use_live_stripe": settings.get("use_live_stripe", False),
        "test_mode": not settings.get("use_live_stripe", False),
        "has_test_keys": bool(STRIPE_TEST_SECRET_KEY),
        "has_live_keys": bool(STRIPE_LIVE_SECRET_KEY)
    }

@api_router.put("/admin/stripe/settings")
async def update_stripe_settings(request: StripeSettingsUpdate):
    """Toggle between Stripe test and live modes"""
    settings = await db.company_settings.find_one()
    
    if not settings:
        # Create default settings
        settings = {
            "use_live_stripe": request.use_live_stripe,
            "updated_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        await db.company_settings.insert_one(settings)
    else:
        await db.company_settings.update_one(
            {"_id": settings["_id"]},
            {"$set": {"use_live_stripe": request.use_live_stripe, "updated_at": datetime.utcnow()}}
        )
    
    mode = "LIVE" if request.use_live_stripe else "TEST"
    
    return {
        "message": f"Stripe mode updated to {mode}",
        "use_live_stripe": request.use_live_stripe,
        "mode": mode
    }

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
