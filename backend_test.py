#!/usr/bin/env python3
"""
Backend API Testing for Search and Advanced Search Integration
ExperTrait Mobile App - Testing Agent

This script tests the backend APIs required for the mobile app's search and advanced search functionality.
"""

import requests
import json
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime

# Configuration
BACKEND_URL = "https://homeservices-app.preview.emergentagent.com/api"
TIMEOUT = 30

class SearchAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name, passed, details=""):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status}: {test_name}"
        if details:
            result += f" - {details}"
        
        print(result)
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
    
    def test_app_settings_api(self):
        """Test App Settings API (Priority: HIGH)"""
        print("\n🔧 TESTING APP SETTINGS API (Priority: HIGH)")
        print("=" * 60)
        
        # Test 1: GET /api/admin/app-settings - Should return default settings
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/app-settings")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    "app_name", "app_logo_url", "customer_privacy_policy", 
                    "customer_terms_of_use", "handler_privacy_policy", 
                    "handler_terms_of_use", "partner_privacy_policy", 
                    "partner_terms_of_use"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    self.log_test("GET /admin/app-settings returns all required fields", True, 
                                f"All 8 required fields present: {', '.join(required_fields)}")
                else:
                    self.log_test("GET /admin/app-settings returns all required fields", False, 
                                f"Missing fields: {missing_fields}")
                
                # Check default values
                if data.get("app_name") == "ExperTrait":
                    self.log_test("GET /admin/app-settings returns correct default app_name", True, 
                                "app_name = 'ExperTrait'")
                else:
                    self.log_test("GET /admin/app-settings returns correct default app_name", False, 
                                f"Expected 'ExperTrait', got '{data.get('app_name')}'")
            else:
                self.log_test("GET /admin/app-settings", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET /admin/app-settings", False, f"Exception: {str(e)}")
        
        # Test 2: PUT /api/admin/app-settings - Should save/update settings
        try:
            test_settings = {
                "app_name": "ExperTrait Updated",
                "app_logo_url": "/test-logo.svg",
                "customer_privacy_policy": "Updated customer privacy policy for testing",
                "customer_terms_of_use": "Updated customer terms for testing",
                "handler_privacy_policy": "Updated handler privacy policy for testing",
                "handler_terms_of_use": "Updated handler terms for testing",
                "partner_privacy_policy": "Updated partner privacy policy for testing",
                "partner_terms_of_use": "Updated partner terms for testing"
            }
            
            response = self.session.put(f"{BACKEND_URL}/admin/app-settings", 
                                      json=test_settings,
                                      headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "updated_fields" in data:
                    self.log_test("PUT /admin/app-settings updates settings", True, 
                                f"Updated {len(data['updated_fields'])} fields")
                else:
                    self.log_test("PUT /admin/app-settings updates settings", False, 
                                f"Unexpected response format: {data}")
            else:
                self.log_test("PUT /admin/app-settings updates settings", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("PUT /admin/app-settings updates settings", False, f"Exception: {str(e)}")
        
        # Test 3: Verify settings were saved by getting them again
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/app-settings")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("app_name") == "ExperTrait Updated":
                    self.log_test("PUT /admin/app-settings persists changes", True, 
                                "Settings successfully saved and retrieved")
                else:
                    self.log_test("PUT /admin/app-settings persists changes", False, 
                                f"Expected 'ExperTrait Updated', got '{data.get('app_name')}'")
            else:
                self.log_test("PUT /admin/app-settings persists changes", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("PUT /admin/app-settings persists changes", False, f"Exception: {str(e)}")
    
    def test_chat_history_api(self):
        """Test Chat History API (Priority: MEDIUM)"""
        print("\n💬 TESTING CHAT HISTORY API (Priority: MEDIUM)")
        print("=" * 60)
        
        # Test 1: GET /api/admin/chat-history - Should return empty list if no chats
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/chat-history")
            
            if response.status_code == 200:
                data = response.json()
                if "chats" in data and "total" in data:
                    self.log_test("GET /admin/chat-history returns proper structure", True, 
                                f"Found {data['total']} chats")
                    
                    # Check if it's empty or has data
                    if data["total"] == 0:
                        self.log_test("GET /admin/chat-history handles empty state", True, 
                                    "Returns empty list when no chats exist")
                    else:
                        self.log_test("GET /admin/chat-history returns chat data", True, 
                                    f"Found {data['total']} chat messages")
                else:
                    self.log_test("GET /admin/chat-history returns proper structure", False, 
                                f"Missing 'chats' or 'total' field: {data}")
            else:
                self.log_test("GET /admin/chat-history", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET /admin/chat-history", False, f"Exception: {str(e)}")
        
        # Test 2: GET /api/admin/chat-history?limit=10 - Should respect limit parameter
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/chat-history?limit=5")
            
            if response.status_code == 200:
                data = response.json()
                if "chats" in data:
                    chat_count = len(data["chats"])
                    if chat_count <= 5:
                        self.log_test("GET /admin/chat-history respects limit parameter", True, 
                                    f"Returned {chat_count} chats (limit=5)")
                    else:
                        self.log_test("GET /admin/chat-history respects limit parameter", False, 
                                    f"Returned {chat_count} chats, expected ≤5")
                else:
                    self.log_test("GET /admin/chat-history respects limit parameter", False, 
                                "Missing 'chats' field in response")
            else:
                self.log_test("GET /admin/chat-history with limit", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET /admin/chat-history with limit", False, f"Exception: {str(e)}")
        
        # Test 3: Test with different limit values
        for limit in [1, 3, 50]:
            try:
                response = self.session.get(f"{BACKEND_URL}/admin/chat-history?limit={limit}")
                
                if response.status_code == 200:
                    data = response.json()
                    chat_count = len(data.get("chats", []))
                    if chat_count <= limit:
                        self.log_test(f"GET /admin/chat-history limit={limit}", True, 
                                    f"Returned {chat_count} chats")
                    else:
                        self.log_test(f"GET /admin/chat-history limit={limit}", False, 
                                    f"Returned {chat_count} chats, expected ≤{limit}")
                else:
                    self.log_test(f"GET /admin/chat-history limit={limit}", False, 
                                f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"GET /admin/chat-history limit={limit}", False, f"Exception: {str(e)}")
    
    def test_send_email_api(self):
        """Test Send Email API (Priority: HIGH)"""
        print("\n📧 TESTING SEND EMAIL API (Priority: HIGH)")
        print("=" * 60)
        
        # Test 1: POST /api/admin/send-email with recipient_type="user" - Should handle sending to all customers
        try:
            email_data = {
                "recipient_type": "user",
                "subject": "Test Email to All Customers",
                "body": "This is a test email sent to all customers from the admin dashboard.",
                "send_to_all": True
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/send-email", 
                                       json=email_data,
                                       headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                if "sent_count" in data and "total_recipients" in data:
                    self.log_test("POST /admin/send-email to all customers", True, 
                                f"Sent to {data['sent_count']}/{data['total_recipients']} customers")
                else:
                    self.log_test("POST /admin/send-email to all customers", True, 
                                "Email sending completed (SendGrid mocked)")
            else:
                self.log_test("POST /admin/send-email to all customers", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST /admin/send-email to all customers", False, f"Exception: {str(e)}")
        
        # Test 2: POST /api/admin/send-email with recipient_type="handler" - Should handle sending to all handlers
        try:
            email_data = {
                "recipient_type": "handler",
                "subject": "Test Email to All Handlers",
                "body": "This is a test email sent to all handlers from the admin dashboard.",
                "send_to_all": True
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/send-email", 
                                       json=email_data,
                                       headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                if "sent_count" in data and "total_recipients" in data:
                    self.log_test("POST /admin/send-email to all handlers", True, 
                                f"Sent to {data['sent_count']}/{data['total_recipients']} handlers")
                else:
                    self.log_test("POST /admin/send-email to all handlers", True, 
                                "Email sending completed (SendGrid mocked)")
            else:
                self.log_test("POST /admin/send-email to all handlers", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST /admin/send-email to all handlers", False, f"Exception: {str(e)}")
        
        # Test 3: POST /api/admin/send-email with recipient_type="partner" - Should handle sending to all partners
        try:
            email_data = {
                "recipient_type": "partner",
                "subject": "Test Email to All Partners",
                "body": "This is a test email sent to all partners from the admin dashboard.",
                "send_to_all": True
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/send-email", 
                                       json=email_data,
                                       headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                data = response.json()
                if "sent_count" in data and "total_recipients" in data:
                    self.log_test("POST /admin/send-email to all partners", True, 
                                f"Sent to {data['sent_count']}/{data['total_recipients']} partners")
                else:
                    self.log_test("POST /admin/send-email to all partners", True, 
                                "Email sending completed (SendGrid mocked)")
            else:
                self.log_test("POST /admin/send-email to all partners", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST /admin/send-email to all partners", False, f"Exception: {str(e)}")
        
        # Test 4: Validation - Empty subject should fail
        try:
            email_data = {
                "recipient_type": "user",
                "subject": "",  # Empty subject
                "body": "This should fail due to empty subject.",
                "send_to_all": True
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/send-email", 
                                       json=email_data,
                                       headers={"Content-Type": "application/json"})
            
            if response.status_code == 422:  # Validation error
                self.log_test("POST /admin/send-email validates empty subject", True, 
                            "Correctly rejects empty subject")
            elif response.status_code == 400:
                self.log_test("POST /admin/send-email validates empty subject", True, 
                            "Correctly rejects empty subject (400 error)")
            else:
                self.log_test("POST /admin/send-email validates empty subject", False, 
                            f"Expected validation error, got HTTP {response.status_code}")
        except Exception as e:
            self.log_test("POST /admin/send-email validates empty subject", False, f"Exception: {str(e)}")
        
        # Test 5: Validation - Empty body should fail
        try:
            email_data = {
                "recipient_type": "user",
                "subject": "Test Subject",
                "body": "",  # Empty body
                "send_to_all": True
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/send-email", 
                                       json=email_data,
                                       headers={"Content-Type": "application/json"})
            
            if response.status_code == 422:  # Validation error
                self.log_test("POST /admin/send-email validates empty body", True, 
                            "Correctly rejects empty body")
            elif response.status_code == 400:
                self.log_test("POST /admin/send-email validates empty body", True, 
                            "Correctly rejects empty body (400 error)")
            else:
                self.log_test("POST /admin/send-email validates empty body", False, 
                            f"Expected validation error, got HTTP {response.status_code}")
        except Exception as e:
            self.log_test("POST /admin/send-email validates empty body", False, f"Exception: {str(e)}")
        
        # Test 6: Invalid recipient_type should fail
        try:
            email_data = {
                "recipient_type": "invalid_type",
                "subject": "Test Subject",
                "body": "Test body",
                "send_to_all": True
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/send-email", 
                                       json=email_data,
                                       headers={"Content-Type": "application/json"})
            
            if response.status_code in [400, 422]:
                self.log_test("POST /admin/send-email validates recipient_type", True, 
                            "Correctly rejects invalid recipient_type")
            else:
                self.log_test("POST /admin/send-email validates recipient_type", False, 
                            f"Expected validation error, got HTTP {response.status_code}")
        except Exception as e:
            self.log_test("POST /admin/send-email validates recipient_type", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all Admin Dashboard API tests"""
        print("🚀 STARTING ADMIN DASHBOARD BACKEND API TESTING")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        # Run tests in priority order
        self.test_app_settings_api()      # Priority: HIGH
        self.test_send_email_api()        # Priority: HIGH  
        self.test_chat_history_api()      # Priority: MEDIUM
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 ADMIN DASHBOARD API TESTING SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Admin Dashboard APIs are working great!")
        elif success_rate >= 75:
            print("✅ GOOD: Admin Dashboard APIs are mostly working")
        elif success_rate >= 50:
            print("⚠️  MODERATE: Some Admin Dashboard APIs need attention")
        else:
            print("❌ CRITICAL: Major issues with Admin Dashboard APIs")
        
        # Show failed tests
        failed_tests = [test for test in self.test_results if not test["passed"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        print("=" * 80)
        return success_rate >= 75

if __name__ == "__main__":
    tester = AdminDashboardTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)