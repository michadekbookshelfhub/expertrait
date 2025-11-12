#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Oscar Home Services
Tests all endpoints with realistic data and proper error handling
"""

import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import sys
import os

# Backend URL from environment
BACKEND_URL = "https://movie-awards.preview.emergentagent.com/api"

class APITester:
    def __init__(self):
        self.session = None
        self.test_data = {}
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{BACKEND_URL}{endpoint}"
        try:
            async with self.session.request(
                method, 
                url, 
                json=data, 
                params=params,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return response.status < 400, response_data, response.status
        except Exception as e:
            return False, str(e), 0
    
    # ==================== Authentication Tests ====================
    
    async def test_register_customer(self):
        """Test customer registration"""
        import time
        timestamp = int(time.time())
        customer_data = {
            "name": "Sarah Johnson",
            "email": f"sarah.johnson.{timestamp}@email.com",
            "password": "SecurePass123!",
            "phone": "+1-555-0123",
            "address": "123 Main St, Springfield, IL 62701",
            "user_type": "customer"
        }
        
        success, response, status = await self.make_request("POST", "/auth/register", customer_data)
        
        if success and status == 200:
            self.test_data["customer"] = response
            self.log_result("Customer Registration", True, f"Customer ID: {response.get('id')}")
        else:
            self.log_result("Customer Registration", False, f"Status: {status}", response)
    
    async def test_register_professional(self):
        """Test professional registration"""
        professional_data = {
            "name": "Mike Rodriguez",
            "email": "mike.rodriguez@email.com",
            "password": "SecurePass123!",
            "phone": "+1-555-0456",
            "skills": ["Plumbing", "Electrical", "HVAC"],
            "bio": "Experienced home service professional with 10+ years in plumbing and electrical work."
        }
        
        success, response, status = await self.make_request("POST", "/auth/register", {
            **professional_data,
            "user_type": "professional"
        })
        
        if success and status == 200:
            self.test_data["professional"] = response
            self.log_result("Professional Registration", True, f"Professional ID: {response.get('id')}")
        else:
            self.log_result("Professional Registration", False, f"Status: {status}", response)
    
    async def test_login_success(self):
        """Test successful login"""
        if "customer" not in self.test_data:
            self.log_result("Login Success Test", False, "Customer not registered")
            return
        
        login_data = {
            "email": "sarah.johnson@email.com",
            "password": "SecurePass123!"
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", login_data)
        
        if success and status == 200 and "user" in response:
            self.log_result("Login Success", True, f"User: {response['user']['name']}")
        else:
            self.log_result("Login Success", False, f"Status: {status}", response)
    
    async def test_login_failure(self):
        """Test login with wrong credentials"""
        login_data = {
            "email": "sarah.johnson@email.com",
            "password": "WrongPassword"
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", login_data)
        
        if not success and status == 401:
            self.log_result("Login Failure Test", True, "Correctly rejected invalid credentials")
        else:
            self.log_result("Login Failure Test", False, f"Should have failed with 401, got {status}", response)
    
    # ==================== Services Tests ====================
    
    async def test_seed_services(self):
        """Seed services data"""
        success, response, status = await self.make_request("POST", "/seed/services")
        
        if success and status == 200:
            self.log_result("Seed Services", True, response.get("message", ""))
        else:
            self.log_result("Seed Services", False, f"Status: {status}", response)
    
    async def test_get_all_services(self):
        """Test getting all services"""
        success, response, status = await self.make_request("GET", "/services")
        
        if success and status == 200 and isinstance(response, list):
            service_count = len(response)
            self.test_data["services"] = response
            if service_count >= 30:  # Should have 31 services
                self.log_result("Get All Services", True, f"Retrieved {service_count} services")
            else:
                self.log_result("Get All Services", False, f"Expected ~31 services, got {service_count}")
        else:
            self.log_result("Get All Services", False, f"Status: {status}", response)
    
    async def test_get_services_by_category(self):
        """Test filtering services by category"""
        success, response, status = await self.make_request("GET", "/services", params={"category": "Plumbing"})
        
        if success and status == 200 and isinstance(response, list):
            plumbing_services = [s for s in response if s.get("category") == "Plumbing"]
            if len(plumbing_services) > 0:
                self.log_result("Filter Services by Category", True, f"Found {len(plumbing_services)} plumbing services")
            else:
                self.log_result("Filter Services by Category", False, "No plumbing services found")
        else:
            self.log_result("Filter Services by Category", False, f"Status: {status}", response)
    
    async def test_get_categories(self):
        """Test getting all categories"""
        success, response, status = await self.make_request("GET", "/categories")
        
        if success and status == 200 and "categories" in response:
            categories = response["categories"]
            if len(categories) >= 10:  # Should have 10 categories
                self.log_result("Get Categories", True, f"Retrieved {len(categories)} categories")
            else:
                self.log_result("Get Categories", False, f"Expected ~10 categories, got {len(categories)}")
        else:
            self.log_result("Get Categories", False, f"Status: {status}", response)
    
    async def test_get_specific_service(self):
        """Test getting specific service details"""
        if "services" not in self.test_data or not self.test_data["services"]:
            self.log_result("Get Specific Service", False, "No services available")
            return
        
        service_id = self.test_data["services"][0]["id"]
        success, response, status = await self.make_request("GET", f"/services/{service_id}")
        
        if success and status == 200 and response.get("id") == service_id:
            self.log_result("Get Specific Service", True, f"Service: {response.get('name')}")
        else:
            self.log_result("Get Specific Service", False, f"Status: {status}", response)
    
    # ==================== Booking Tests ====================
    
    async def test_create_booking(self):
        """Test creating a booking"""
        if "customer" not in self.test_data or "services" not in self.test_data:
            self.log_result("Create Booking", False, "Missing customer or services data")
            return
        
        service = self.test_data["services"][0]  # Use first service
        booking_data = {
            "service_id": service["id"],
            "customer_id": self.test_data["customer"]["id"],
            "scheduled_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "location": {
                "latitude": 39.7817,
                "longitude": -89.6501
            },
            "notes": "Please call when you arrive. Gate code is 1234."
        }
        
        success, response, status = await self.make_request("POST", "/bookings", booking_data)
        
        if success and status == 200:
            self.test_data["booking"] = response
            self.log_result("Create Booking", True, f"Booking ID: {response.get('id')}")
        else:
            self.log_result("Create Booking", False, f"Status: {status}", response)
    
    async def test_get_customer_bookings(self):
        """Test getting customer's bookings"""
        if "customer" not in self.test_data:
            self.log_result("Get Customer Bookings", False, "No customer data")
            return
        
        customer_id = self.test_data["customer"]["id"]
        success, response, status = await self.make_request("GET", f"/bookings/customer/{customer_id}")
        
        if success and status == 200 and isinstance(response, list):
            self.log_result("Get Customer Bookings", True, f"Found {len(response)} bookings")
        else:
            self.log_result("Get Customer Bookings", False, f"Status: {status}", response)
    
    async def test_get_pending_bookings(self):
        """Test getting pending bookings"""
        success, response, status = await self.make_request("GET", "/bookings/pending")
        
        if success and status == 200 and isinstance(response, list):
            self.log_result("Get Pending Bookings", True, f"Found {len(response)} pending bookings")
        else:
            self.log_result("Get Pending Bookings", False, f"Status: {status}", response)
    
    async def test_accept_booking(self):
        """Test professional accepting a booking"""
        if "booking" not in self.test_data or "professional" not in self.test_data:
            self.log_result("Accept Booking", False, "Missing booking or professional data")
            return
        
        booking_id = self.test_data["booking"]["id"]
        professional_id = self.test_data["professional"]["id"]
        
        update_data = {
            "status": "accepted",
            "professional_id": professional_id
        }
        
        success, response, status = await self.make_request("PATCH", f"/bookings/{booking_id}", update_data)
        
        if success and status == 200 and response.get("status") == "accepted":
            self.test_data["booking"] = response  # Update booking data
            self.log_result("Accept Booking", True, f"Booking accepted by professional")
        else:
            self.log_result("Accept Booking", False, f"Status: {status}", response)
    
    async def test_start_job(self):
        """Test starting a job"""
        if "booking" not in self.test_data:
            self.log_result("Start Job", False, "No booking data")
            return
        
        booking_id = self.test_data["booking"]["id"]
        update_data = {
            "status": "in_progress",
            "actual_start": datetime.utcnow().isoformat()
        }
        
        success, response, status = await self.make_request("PATCH", f"/bookings/{booking_id}", update_data)
        
        if success and status == 200 and response.get("status") == "in_progress":
            self.test_data["booking"] = response
            self.log_result("Start Job", True, "Job started successfully")
        else:
            self.log_result("Start Job", False, f"Status: {status}", response)
    
    async def test_complete_job(self):
        """Test completing a job"""
        if "booking" not in self.test_data:
            self.log_result("Complete Job", False, "No booking data")
            return
        
        booking_id = self.test_data["booking"]["id"]
        update_data = {
            "status": "completed",
            "actual_end": datetime.utcnow().isoformat()
        }
        
        success, response, status = await self.make_request("PATCH", f"/bookings/{booking_id}", update_data)
        
        if success and status == 200 and response.get("status") == "completed":
            self.test_data["booking"] = response
            self.log_result("Complete Job", True, "Job completed successfully")
        else:
            self.log_result("Complete Job", False, f"Status: {status}", response)
    
    # ==================== Professional Tests ====================
    
    async def test_get_professionals(self):
        """Test getting all professionals"""
        success, response, status = await self.make_request("GET", "/professionals")
        
        if success and status == 200 and isinstance(response, list):
            self.log_result("Get Professionals", True, f"Found {len(response)} professionals")
        else:
            self.log_result("Get Professionals", False, f"Status: {status}", response)
    
    async def test_update_availability(self):
        """Test updating professional availability"""
        if "professional" not in self.test_data:
            self.log_result("Update Availability", False, "No professional data")
            return
        
        professional_id = self.test_data["professional"]["id"]
        success, response, status = await self.make_request("PATCH", f"/professionals/{professional_id}/availability", params={"available": False})
        
        if success and status == 200:
            self.log_result("Update Availability", True, "Availability updated successfully")
        else:
            self.log_result("Update Availability", False, f"Status: {status}", response)
    
    async def test_update_location(self):
        """Test updating professional location"""
        if "professional" not in self.test_data:
            self.log_result("Update Location", False, "No professional data")
            return
        
        professional_id = self.test_data["professional"]["id"]
        location_data = {
            "professional_id": professional_id,
            "latitude": 39.7817,
            "longitude": -89.6501,
            "accuracy": 10.0
        }
        
        success, response, status = await self.make_request("PATCH", f"/professionals/{professional_id}/location", location_data)
        
        if success and status == 200:
            self.log_result("Update Location", True, "Location updated successfully")
        else:
            self.log_result("Update Location", False, f"Status: {status}", response)
    
    # ==================== Review Tests ====================
    
    async def test_create_review(self):
        """Test creating a review for completed booking"""
        if "booking" not in self.test_data or self.test_data["booking"].get("status") != "completed":
            self.log_result("Create Review", False, "No completed booking available")
            return
        
        review_data = {
            "booking_id": self.test_data["booking"]["id"],
            "customer_id": self.test_data["customer"]["id"],
            "professional_id": self.test_data["professional"]["id"],
            "rating": 5,
            "comment": "Excellent service! Mike was professional, punctual, and did great work. Highly recommended!"
        }
        
        success, response, status = await self.make_request("POST", "/reviews", review_data)
        
        if success and status == 200:
            self.test_data["review"] = response
            self.log_result("Create Review", True, f"Review created with rating: {response.get('rating')}")
        else:
            self.log_result("Create Review", False, f"Status: {status}", response)
    
    async def test_get_professional_reviews(self):
        """Test getting professional reviews"""
        if "professional" not in self.test_data:
            self.log_result("Get Professional Reviews", False, "No professional data")
            return
        
        professional_id = self.test_data["professional"]["id"]
        success, response, status = await self.make_request("GET", f"/reviews/professional/{professional_id}")
        
        if success and status == 200 and isinstance(response, list):
            self.log_result("Get Professional Reviews", True, f"Found {len(response)} reviews")
        else:
            self.log_result("Get Professional Reviews", False, f"Status: {status}", response)
    
    # ==================== AI Recommendations Tests ====================
    
    async def test_ai_recommendations(self):
        """Test AI recommendations"""
        if "customer" not in self.test_data:
            self.log_result("AI Recommendations", False, "No customer data")
            return
        
        customer_id = self.test_data["customer"]["id"]
        success, response, status = await self.make_request("GET", f"/recommendations/{customer_id}")
        
        if success and status == 200 and "recommendations" in response:
            recommendations = response["recommendations"]
            self.log_result("AI Recommendations", True, f"Got {len(recommendations)} recommendations")
        else:
            self.log_result("AI Recommendations", False, f"Status: {status}", response)
    
    # ==================== Payment Tests ====================
    
    async def test_create_checkout_session(self):
        """Test creating Stripe checkout session"""
        if "booking" not in self.test_data:
            self.log_result("Create Checkout Session", False, "No booking data")
            return
        
        payment_data = {
            "booking_id": self.test_data["booking"]["id"],
            "origin_url": "https://movie-awards.preview.emergentagent.com"
        }
        
        success, response, status = await self.make_request("POST", "/checkout/session", payment_data)
        
        if success and status == 200 and "url" in response:
            self.log_result("Create Checkout Session", True, "Checkout session created successfully")
        else:
            self.log_result("Create Checkout Session", False, f"Status: {status}", response)
    
    # ==================== Edge Case Tests ====================
    
    async def test_invalid_service_id(self):
        """Test getting service with invalid ID"""
        success, response, status = await self.make_request("GET", "/services/invalid_id")
        
        if not success and status == 400:
            self.log_result("Invalid Service ID Test", True, "Correctly rejected invalid ID")
        else:
            self.log_result("Invalid Service ID Test", False, f"Should have failed with 400, got {status}")
    
    async def test_duplicate_email_registration(self):
        """Test registering with duplicate email"""
        duplicate_data = {
            "name": "Another User",
            "email": "sarah.johnson@email.com",  # Same email as first customer
            "password": "AnotherPass123!",
            "phone": "+1-555-9999",
            "user_type": "customer"
        }
        
        success, response, status = await self.make_request("POST", "/auth/register", duplicate_data)
        
        if not success and status == 400:
            self.log_result("Duplicate Email Test", True, "Correctly rejected duplicate email")
        else:
            self.log_result("Duplicate Email Test", False, f"Should have failed with 400, got {status}")
    
    # ==================== Main Test Runner ====================
    
    async def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Oscar Home Services Backend API Tests")
        print(f"🔗 Testing against: {BACKEND_URL}")
        print("=" * 60)
        
        # Test sequence following the booking workflow
        test_sequence = [
            # Authentication
            ("Authentication", [
                self.test_register_customer,
                self.test_register_professional,
                self.test_login_success,
                self.test_login_failure,
                self.test_duplicate_email_registration,
            ]),
            
            # Services
            ("Services", [
                self.test_seed_services,
                self.test_get_all_services,
                self.test_get_services_by_category,
                self.test_get_categories,
                self.test_get_specific_service,
                self.test_invalid_service_id,
            ]),
            
            # Booking Workflow
            ("Booking Workflow", [
                self.test_create_booking,
                self.test_get_customer_bookings,
                self.test_get_pending_bookings,
                self.test_accept_booking,
                self.test_start_job,
                self.test_complete_job,
            ]),
            
            # Professionals
            ("Professional Management", [
                self.test_get_professionals,
                self.test_update_availability,
                self.test_update_location,
            ]),
            
            # Reviews
            ("Review System", [
                self.test_create_review,
                self.test_get_professional_reviews,
            ]),
            
            # AI & Payments
            ("AI & Payments", [
                self.test_ai_recommendations,
                self.test_create_checkout_session,
            ]),
        ]
        
        for category, tests in test_sequence:
            print(f"\n📋 {category} Tests:")
            print("-" * 40)
            
            for test in tests:
                try:
                    await test()
                except Exception as e:
                    self.log_result(test.__name__, False, f"Exception: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📈 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print(f"\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results['failed'] == 0

async def main():
    """Main test runner"""
    async with APITester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)