#!/usr/bin/env python3
"""
Comprehensive Partner System API Testing for ExperTrait Healthcare Platform
Testing Partner Registration, Authentication, Admin Management, and Data Access APIs
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://ondemand-care.preview.emergentagent.com/api"
HEALTHCARE_CATEGORIES = [
    "Baby Sitter",
    "Dog Sitter", 
    "Mental Support Worker",
    "Domiciliary Care Worker",
    "Support Worker (Sit-in)"
]

class PartnerAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_partners = []
        self.created_handlers = []
        self.created_bookings = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{BASE_URL}{endpoint}"
            
            if method.upper() == "GET":
                response = self.session.get(url, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url)
            else:
                return False, {"error": "Invalid HTTP method"}, 400
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
            
            return response.status_code < 400, response_data, response.status_code
            
        except Exception as e:
            return False, {"error": str(e)}, 500

    # ==================== PRIORITY 1: Partner Registration & Authentication ====================
    
    def test_partner_registration_success(self):
        """Test successful partner registration with all required fields"""
        partner_data = {
            "name": "Dr. Sarah Johnson",
            "email": "sarah.johnson@healthcareplus.com",
            "password": "SecurePass123!",
            "organization_name": "HealthCare Plus Ltd",
            "license_number": "HC-2024-001",
            "phone": "+44 20 7946 0958",
            "address": "123 Healthcare Street, London, UK",
            "healthcare_category": "Mental Support Worker"
        }
        
        success, response, status_code = self.make_request("POST", "/partner/register", partner_data)
        
        if success and "partner_id" in response:
            self.created_partners.append({
                "id": response["partner_id"],
                "email": partner_data["email"],
                "password": partner_data["password"],
                "category": partner_data["healthcare_category"]
            })
            self.log_test(
                "Partner Registration - Success Case",
                True,
                f"Partner registered with ID: {response['partner_id']}, Status: {response.get('status', 'unknown')}",
                response
            )
        else:
            self.log_test(
                "Partner Registration - Success Case",
                False,
                f"Registration failed with status {status_code}",
                response
            )

    def test_partner_registration_invalid_category(self):
        """Test partner registration with invalid healthcare category"""
        partner_data = {
            "name": "Dr. Invalid Category",
            "email": "invalid@test.com",
            "password": "SecurePass123!",
            "organization_name": "Invalid Care Ltd",
            "license_number": "IC-2024-001",
            "phone": "+44 20 7946 0959",
            "address": "456 Invalid Street, London, UK",
            "healthcare_category": "Invalid Category"
        }
        
        success, response, status_code = self.make_request("POST", "/partner/register", partner_data)
        
        expected_failure = not success and status_code == 400
        self.log_test(
            "Partner Registration - Invalid Healthcare Category",
            expected_failure,
            f"Expected 400 error for invalid category, got {status_code}",
            response
        )

    def test_partner_registration_duplicate_email(self):
        """Test partner registration with duplicate email"""
        if not self.created_partners:
            self.log_test(
                "Partner Registration - Duplicate Email",
                False,
                "No existing partner to test duplicate email",
                {}
            )
            return
            
        partner_data = {
            "name": "Dr. Duplicate Email",
            "email": self.created_partners[0]["email"],  # Use existing email
            "password": "AnotherPass123!",
            "organization_name": "Duplicate Care Ltd",
            "license_number": "DC-2024-001",
            "phone": "+44 20 7946 0960",
            "address": "789 Duplicate Street, London, UK",
            "healthcare_category": "Baby Sitter"
        }
        
        success, response, status_code = self.make_request("POST", "/partner/register", partner_data)
        
        expected_failure = not success and status_code == 400
        self.log_test(
            "Partner Registration - Duplicate Email Rejection",
            expected_failure,
            f"Expected 400 error for duplicate email, got {status_code}",
            response
        )

    def test_partner_login_pending_status(self):
        """Test partner login with pending status (should be rejected)"""
        if not self.created_partners:
            self.log_test(
                "Partner Login - Pending Status Rejection",
                False,
                "No partner available for login test",
                {}
            )
            return
            
        partner = self.created_partners[0]
        login_data = {
            "email": partner["email"],
            "password": partner["password"]
        }
        
        success, response, status_code = self.make_request("POST", "/partner/login", login_data)
        
        # Should fail with 403 because partner is still pending
        expected_failure = not success and status_code == 403
        self.log_test(
            "Partner Login - Pending Status Rejection",
            expected_failure,
            f"Expected 403 error for pending partner, got {status_code}",
            response
        )

    def test_partner_login_invalid_credentials(self):
        """Test partner login with wrong password"""
        if not self.created_partners:
            self.log_test(
                "Partner Login - Invalid Credentials",
                False,
                "No partner available for login test",
                {}
            )
            return
            
        partner = self.created_partners[0]
        login_data = {
            "email": partner["email"],
            "password": "WrongPassword123!"
        }
        
        success, response, status_code = self.make_request("POST", "/partner/login", login_data)
        
        expected_failure = not success and status_code == 401
        self.log_test(
            "Partner Login - Invalid Credentials",
            expected_failure,
            f"Expected 401 error for wrong password, got {status_code}",
            response
        )

    def test_partner_login_nonexistent_email(self):
        """Test partner login with non-existent email"""
        login_data = {
            "email": "nonexistent@partner.com",
            "password": "SomePassword123!"
        }
        
        success, response, status_code = self.make_request("POST", "/partner/login", login_data)
        
        expected_failure = not success and status_code == 401
        self.log_test(
            "Partner Login - Non-existent Email",
            expected_failure,
            f"Expected 401 error for non-existent email, got {status_code}",
            response
        )

    # ==================== PRIORITY 2: Admin Partner Management ====================
    
    def test_admin_approve_partner(self):
        """Test admin approving a partner"""
        if not self.created_partners:
            self.log_test(
                "Admin Partner Approval",
                False,
                "No partner available for approval test",
                {}
            )
            return
            
        partner_id = self.created_partners[0]["id"]
        
        # Note: The API expects status as a query parameter, not in request body
        success, response, status_code = self.make_request(
            "PUT", 
            f"/admin/partners/{partner_id}/status?status=approved"
        )
        
        if success:
            # Update partner status in our tracking
            self.created_partners[0]["status"] = "approved"
            
        self.log_test(
            "Admin Partner Approval",
            success,
            f"Partner approval status: {status_code}",
            response
        )

    def test_admin_reject_partner(self):
        """Test admin rejecting a partner"""
        # Create another partner for rejection test
        partner_data = {
            "name": "Dr. Reject Test",
            "email": "reject.test@healthcare.com",
            "password": "RejectPass123!",
            "organization_name": "Reject Test Care",
            "license_number": "RT-2024-001",
            "phone": "+44 20 7946 0961",
            "address": "999 Reject Street, London, UK",
            "healthcare_category": "Dog Sitter"
        }
        
        reg_success, reg_response, _ = self.make_request("POST", "/partner/register", partner_data)
        
        if not reg_success or "partner_id" not in reg_response:
            self.log_test(
                "Admin Partner Rejection",
                False,
                "Failed to create partner for rejection test",
                reg_response
            )
            return
            
        partner_id = reg_response["partner_id"]
        
        success, response, status_code = self.make_request(
            "PUT", 
            f"/admin/partners/{partner_id}/status?status=rejected"
        )
        
        self.log_test(
            "Admin Partner Rejection",
            success,
            f"Partner rejection status: {status_code}",
            response
        )

    def test_admin_suspend_partner(self):
        """Test admin suspending a partner"""
        if not self.created_partners or self.created_partners[0].get("status") != "approved":
            self.log_test(
                "Admin Partner Suspension",
                False,
                "No approved partner available for suspension test",
                {}
            )
            return
            
        partner_id = self.created_partners[0]["id"]
        
        success, response, status_code = self.make_request(
            "PUT", 
            f"/admin/partners/{partner_id}/status?status=suspended"
        )
        
        self.log_test(
            "Admin Partner Suspension",
            success,
            f"Partner suspension status: {status_code}",
            response
        )
        
        # Revert to approved for other tests
        if success:
            self.make_request(
                "PUT", 
                f"/admin/partners/{partner_id}/status?status=approved"
            )

    def test_admin_invalid_partner_status(self):
        """Test admin setting invalid partner status"""
        if not self.created_partners:
            self.log_test(
                "Admin Invalid Partner Status",
                False,
                "No partner available for invalid status test",
                {}
            )
            return
            
        partner_id = self.created_partners[0]["id"]
        
        success, response, status_code = self.make_request(
            "PUT", 
            f"/admin/partners/{partner_id}/status?status=invalid_status"
        )
        
        expected_failure = not success and status_code == 400
        self.log_test(
            "Admin Invalid Partner Status",
            expected_failure,
            f"Expected 400 error for invalid status, got {status_code}",
            response
        )

    def test_admin_invalid_partner_id(self):
        """Test admin operations with invalid partner ID"""
        success, response, status_code = self.make_request(
            "PUT", 
            "/admin/partners/invalid_id/status?status=approved"
        )
        
        expected_failure = not success and status_code == 400
        self.log_test(
            "Admin Invalid Partner ID",
            expected_failure,
            f"Expected 400 error for invalid partner ID, got {status_code}",
            response
        )

    def create_test_handler_with_healthcare_skills(self):
        """Create a test handler with healthcare skills for assignment tests"""
        handler_data = {
            "name": "Healthcare Handler",
            "email": "healthcare.handler@test.com",
            "password": "HandlerPass123!",
            "phone": "+44 20 7946 0962",
            "user_type": "handler",
            "skills": ["Mental Support Worker", "Baby Sitter"]
        }
        
        success, response, status_code = self.make_request("POST", "/auth/register", handler_data)
        
        if success and "id" in response:
            self.created_handlers.append({
                "id": response["id"],
                "email": handler_data["email"],
                "skills": handler_data["skills"]
            })
            return response["id"]
        return None

    def test_admin_assign_handler_to_partner(self):
        """Test admin assigning a healthcare handler to a partner"""
        if not self.created_partners or self.created_partners[0].get("status") != "approved":
            self.log_test(
                "Admin Handler Assignment",
                False,
                "No approved partner available for handler assignment",
                {}
            )
            return
            
        # Create a handler with healthcare skills
        handler_id = self.create_test_handler_with_healthcare_skills()
        if not handler_id:
            self.log_test(
                "Admin Handler Assignment",
                False,
                "Failed to create test handler",
                {}
            )
            return
            
        partner_id = self.created_partners[0]["id"]
        assignment_data = {
            "handler_id": handler_id,
            "partner_id": partner_id,
            "admin_notes": "Assigned for mental health support services"
        }
        
        success, response, status_code = self.make_request(
            "POST", 
            f"/admin/handlers/{handler_id}/assign-partner",
            assignment_data
        )
        
        self.log_test(
            "Admin Handler Assignment",
            success,
            f"Handler assignment status: {status_code}",
            response
        )

    def test_admin_assign_handler_without_healthcare_skills(self):
        """Test admin assigning handler without healthcare skills (should fail)"""
        if not self.created_partners:
            self.log_test(
                "Admin Handler Assignment - No Healthcare Skills",
                False,
                "No partner available for assignment test",
                {}
            )
            return
            
        # Create a handler without healthcare skills
        handler_data = {
            "name": "Regular Handler",
            "email": "regular.handler@test.com",
            "password": "RegularPass123!",
            "phone": "+44 20 7946 0963",
            "user_type": "handler",
            "skills": ["Plumbing", "Electrical"]  # Non-healthcare skills
        }
        
        reg_success, reg_response, _ = self.make_request("POST", "/auth/register", handler_data)
        
        if not reg_success or "id" not in reg_response:
            self.log_test(
                "Admin Handler Assignment - No Healthcare Skills",
                False,
                "Failed to create regular handler for test",
                reg_response
            )
            return
            
        handler_id = reg_response["id"]
        partner_id = self.created_partners[0]["id"]
        assignment_data = {
            "partner_id": partner_id,
            "assignment_notes": "Attempting to assign non-healthcare handler"
        }
        
        success, response, status_code = self.make_request(
            "POST", 
            f"/admin/handlers/{handler_id}/assign-partner",
            assignment_data
        )
        
        # Should fail because handler doesn't have healthcare skills
        expected_failure = not success and status_code == 400
        self.log_test(
            "Admin Handler Assignment - No Healthcare Skills",
            expected_failure,
            f"Expected 400 error for non-healthcare handler, got {status_code}",
            response
        )

    # ==================== PRIORITY 3: Partner Data Access ====================
    
    def test_partner_login_after_approval(self):
        """Test successful partner login after approval"""
        if not self.created_partners or self.created_partners[0].get("status") != "approved":
            self.log_test(
                "Partner Login - After Approval",
                False,
                "No approved partner available for login test",
                {}
            )
            return
            
        partner = self.created_partners[0]
        login_data = {
            "email": partner["email"],
            "password": partner["password"]
        }
        
        success, response, status_code = self.make_request("POST", "/partner/login", login_data)
        
        if success and "id" in response:
            # Store partner details for further tests
            partner["login_response"] = response
            
        self.log_test(
            "Partner Login - After Approval",
            success,
            f"Login status: {status_code}, Partner ID: {response.get('id', 'N/A')}",
            response
        )

    def test_get_partner_handlers(self):
        """Test retrieving handlers assigned to a partner"""
        if not self.created_partners:
            self.log_test(
                "Get Partner Handlers",
                False,
                "No partner available for handlers test",
                {}
            )
            return
            
        partner_id = self.created_partners[0]["id"]
        
        success, response, status_code = self.make_request("GET", f"/partner/{partner_id}/handlers")
        
        if success:
            handler_count = len(response.get("handlers", []))
            total = response.get("total", 0)
            
        self.log_test(
            "Get Partner Handlers",
            success,
            f"Retrieved {handler_count if success else 0} handlers, Total: {total if success else 0}",
            response
        )

    def test_get_partner_handlers_invalid_id(self):
        """Test retrieving handlers with invalid partner ID"""
        success, response, status_code = self.make_request("GET", "/partner/invalid_id/handlers")
        
        expected_failure = not success and status_code == 400
        self.log_test(
            "Get Partner Handlers - Invalid ID",
            expected_failure,
            f"Expected 400 error for invalid partner ID, got {status_code}",
            response
        )

    def create_test_booking_for_healthcare(self):
        """Create a test booking for healthcare services"""
        if not self.created_handlers:
            return None
            
        # Create a customer first
        customer_data = {
            "name": "Healthcare Customer",
            "email": "healthcare.customer@test.com",
            "password": "CustomerPass123!",
            "phone": "+44 20 7946 0964",
            "user_type": "customer"
        }
        
        cust_success, cust_response, _ = self.make_request("POST", "/auth/register", customer_data)
        if not cust_success or "id" not in cust_response:
            return None
            
        customer_id = cust_response["id"]
        
        # Create a healthcare service
        service_data = {
            "category": "Mental Support Worker",
            "name": "Mental Health Support Session",
            "description": "Professional mental health support and counseling",
            "fixed_price": 80.0,
            "estimated_duration": 60
        }
        
        serv_success, serv_response, _ = self.make_request("POST", "/services", service_data)
        if not serv_success or "id" not in serv_response:
            return None
            
        service_id = serv_response["id"]
        
        # Create booking
        booking_data = {
            "service_id": service_id,
            "customer_id": customer_id,
            "scheduled_date": "2024-12-20",
            "time_range_start": "10:00",
            "time_range_end": "11:00",
            "location": {
                "latitude": 51.5074,
                "longitude": -0.1278
            },
            "notes": "Healthcare support booking for testing",
            "terms_agreed": True,
            "service_category": "Mental Support Worker"
        }
        
        book_success, book_response, _ = self.make_request("POST", "/bookings", booking_data)
        if book_success and "id" in book_response:
            self.created_bookings.append(book_response["id"])
            return book_response["id"]
        return None

    def test_get_partner_bookings(self):
        """Test retrieving bookings for a partner's handlers"""
        if not self.created_partners:
            self.log_test(
                "Get Partner Bookings",
                False,
                "No partner available for bookings test",
                {}
            )
            return
            
        # Create a test booking
        booking_id = self.create_test_booking_for_healthcare()
        
        partner_id = self.created_partners[0]["id"]
        
        success, response, status_code = self.make_request("GET", f"/partner/{partner_id}/bookings")
        
        if success:
            booking_count = len(response.get("bookings", []))
            total = response.get("total", 0)
            
        self.log_test(
            "Get Partner Bookings",
            success,
            f"Retrieved {booking_count if success else 0} bookings, Total: {total if success else 0}",
            response
        )

    def test_get_partner_bookings_invalid_id(self):
        """Test retrieving bookings with invalid partner ID"""
        success, response, status_code = self.make_request("GET", "/partner/invalid_id/bookings")
        
        expected_failure = not success and status_code == 400
        self.log_test(
            "Get Partner Bookings - Invalid ID",
            expected_failure,
            f"Expected 400 error for invalid partner ID, got {status_code}",
            response
        )

    # ==================== Test Execution ====================
    
    def run_all_tests(self):
        """Run all Partner System API tests"""
        print("🏥 STARTING COMPREHENSIVE PARTNER SYSTEM API TESTING")
        print("=" * 80)
        print()
        
        print("📋 PRIORITY 1: Partner Registration & Authentication")
        print("-" * 50)
        self.test_partner_registration_success()
        self.test_partner_registration_invalid_category()
        self.test_partner_registration_duplicate_email()
        self.test_partner_login_pending_status()
        self.test_partner_login_invalid_credentials()
        self.test_partner_login_nonexistent_email()
        
        print("👨‍💼 PRIORITY 2: Admin Partner Management")
        print("-" * 50)
        self.test_admin_approve_partner()
        self.test_admin_reject_partner()
        self.test_admin_suspend_partner()
        self.test_admin_invalid_partner_status()
        self.test_admin_invalid_partner_id()
        self.test_admin_assign_handler_to_partner()
        self.test_admin_assign_handler_without_healthcare_skills()
        
        print("📊 PRIORITY 3: Partner Data Access")
        print("-" * 50)
        self.test_partner_login_after_approval()
        self.test_get_partner_handlers()
        self.test_get_partner_handlers_invalid_id()
        self.test_get_partner_bookings()
        self.test_get_partner_bookings_invalid_id()
        
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 80)
        print("🏥 PARTNER SYSTEM API TESTING SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            print("-" * 40)
            for result in self.test_results:
                if not result["success"]:
                    print(f"• {result['test']}")
                    if result["details"]:
                        print(f"  └─ {result['details']}")
            print()
        
        print("📋 TEST DATA CREATED:")
        print(f"• Partners: {len(self.created_partners)}")
        print(f"• Handlers: {len(self.created_handlers)}")
        print(f"• Bookings: {len(self.created_bookings)}")
        print()
        
        if self.created_partners:
            print("🏥 PARTNER DETAILS:")
            for i, partner in enumerate(self.created_partners, 1):
                print(f"Partner {i}:")
                print(f"  • ID: {partner['id']}")
                print(f"  • Email: {partner['email']}")
                print(f"  • Category: {partner['category']}")
                print(f"  • Status: {partner.get('status', 'pending')}")
        
        print("=" * 80)

if __name__ == "__main__":
    tester = PartnerAPITester()
    tester.run_all_tests()