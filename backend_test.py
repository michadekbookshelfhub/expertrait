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
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_result(self, test_name: str, passed: bool, message: str, details: Optional[Dict] = None):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details or {}
        }
        self.results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not passed:
            print(f"   Details: {details}")
    
    def make_request(self, endpoint: str, method: str = "GET", params: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request to backend"""
        url = f"{BACKEND_URL}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, params=params, timeout=TIMEOUT)
            else:
                response = requests.request(method, url, params=params, timeout=TIMEOUT)
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": True,
                    "status_code": response.status_code,
                    "message": response.text
                }
        except requests.exceptions.RequestException as e:
            return {
                "error": True,
                "message": f"Request failed: {str(e)}"
            }
    
    def test_services_endpoint(self):
        """PRIORITY 1: Test GET /api/services endpoint"""
        print("\n🔍 PRIORITY 1 - CORE SEARCH APIs")
        print("=" * 50)
        
        # Test 1: Basic services retrieval
        response = self.make_request("/services")
        
        if response and "error" not in response:
            if isinstance(response, list):
                services_count = len(response)
                self.log_result(
                    "GET /api/services - Basic Retrieval",
                    True,
                    f"Successfully retrieved {services_count} services",
                    {"count": services_count}
                )
                
                # Test service data structure
                if services_count > 0:
                    sample_service = response[0]
                    required_fields = ["id", "name", "description", "category", "fixed_price"]
                    missing_fields = [field for field in required_fields if field not in sample_service]
                    
                    if not missing_fields:
                        self.log_result(
                            "Services Data Structure",
                            True,
                            "All required fields present in services",
                            {"sample_fields": list(sample_service.keys())}
                        )
                    else:
                        self.log_result(
                            "Services Data Structure",
                            False,
                            f"Missing required fields: {missing_fields}",
                            {"sample_service": sample_service}
                        )
                else:
                    self.log_result(
                        "Services Data Structure",
                        False,
                        "No services found to validate structure"
                    )
                    
                return response
            else:
                self.log_result(
                    "GET /api/services - Basic Retrieval",
                    False,
                    "Response is not a list",
                    {"response_type": type(response).__name__}
                )
        else:
            error_msg = response.get("message", "Unknown error") if response else "No response"
            self.log_result(
                "GET /api/services - Basic Retrieval",
                False,
                f"API call failed: {error_msg}",
                response
            )
        
        return None
    
    def test_categories_endpoint(self):
        """PRIORITY 1: Test GET /api/categories endpoint"""
        # Note: Backend has /api/categories but returns {"categories": [...]}
        response = self.make_request("/categories")
        
        if response and "error" not in response:
            if "categories" in response and isinstance(response["categories"], list):
                categories_count = len(response["categories"])
                self.log_result(
                    "GET /api/categories - Categories List",
                    True,
                    f"Successfully retrieved {categories_count} categories",
                    {"categories": response["categories"]}
                )
                return response["categories"]
            else:
                self.log_result(
                    "GET /api/categories - Categories List",
                    False,
                    "Invalid response format - expected {'categories': [...]}"
                )
        else:
            error_msg = response.get("message", "Unknown error") if response else "No response"
            self.log_result(
                "GET /api/categories - Categories List",
                False,
                f"API call failed: {error_msg}",
                response
            )
        
        return None
    
    def test_handlers_endpoint(self):
        """PRIORITY 1: Test GET /api/handlers endpoint"""
        response = self.make_request("/handlers")
        
        if response and "error" not in response:
            if isinstance(response, list):
                handlers_count = len(response)
                self.log_result(
                    "GET /api/handlers - Basic Retrieval",
                    True,
                    f"Successfully retrieved {handlers_count} handlers",
                    {"count": handlers_count}
                )
                
                # Test handler data structure
                if handlers_count > 0:
                    sample_handler = response[0]
                    required_fields = ["id", "name", "rating", "skills", "available"]
                    missing_fields = [field for field in required_fields if field not in sample_handler]
                    
                    if not missing_fields:
                        self.log_result(
                            "Handlers Data Structure",
                            True,
                            "All required fields present in handlers",
                            {"sample_fields": list(sample_handler.keys())}
                        )
                    else:
                        self.log_result(
                            "Handlers Data Structure",
                            False,
                            f"Missing required fields: {missing_fields}",
                            {"sample_handler": sample_handler}
                        )
                else:
                    self.log_result(
                        "Handlers Data Structure",
                        False,
                        "No handlers found to validate structure"
                    )
                    
                return response
            else:
                self.log_result(
                    "GET /api/handlers - Basic Retrieval",
                    False,
                    "Response is not a list",
                    {"response_type": type(response).__name__}
                )
        else:
            error_msg = response.get("message", "Unknown error") if response else "No response"
            self.log_result(
                "GET /api/handlers - Basic Retrieval",
                False,
                f"API call failed: {error_msg}",
                response
            )
        
        return None
    
    def test_category_filtering(self, categories: List[str]):
        """PRIORITY 2: Test category filtering"""
        print("\n🔍 PRIORITY 2 - SEARCH FILTERING")
        print("=" * 50)
        
        if not categories:
            self.log_result(
                "Category Filtering Test",
                False,
                "No categories available for filtering test"
            )
            return
        
        # Test filtering with first available category
        test_category = categories[0]
        response = self.make_request("/services", params={"category": test_category})
        
        if response and "error" not in response:
            if isinstance(response, list):
                filtered_count = len(response)
                
                # Verify all returned services belong to the requested category
                category_match = all(service.get("category") == test_category for service in response)
                
                if category_match:
                    self.log_result(
                        f"Category Filtering - {test_category}",
                        True,
                        f"Successfully filtered {filtered_count} services for category '{test_category}'",
                        {"category": test_category, "count": filtered_count}
                    )
                else:
                    mismatched = [s.get("category") for s in response if s.get("category") != test_category]
                    self.log_result(
                        f"Category Filtering - {test_category}",
                        False,
                        f"Some services don't match requested category",
                        {"requested": test_category, "found_categories": mismatched}
                    )
            else:
                self.log_result(
                    f"Category Filtering - {test_category}",
                    False,
                    "Response is not a list"
                )
        else:
            error_msg = response.get("message", "Unknown error") if response else "No response"
            self.log_result(
                f"Category Filtering - {test_category}",
                False,
                f"API call failed: {error_msg}",
                response
            )
        
        # Test with invalid category
        response = self.make_request("/services", params={"category": "NonExistentCategory"})
        if response and "error" not in response:
            if isinstance(response, list) and len(response) == 0:
                self.log_result(
                    "Invalid Category Filtering",
                    True,
                    "Correctly returns empty list for non-existent category"
                )
            else:
                self.log_result(
                    "Invalid Category Filtering",
                    False,
                    f"Should return empty list for invalid category, got {len(response) if isinstance(response, list) else 'non-list'} items"
                )
    
    def test_data_quality(self, services: List[Dict], handlers: List[Dict]):
        """PRIORITY 3: Test data quality"""
        print("\n🔍 PRIORITY 3 - DATA QUALITY")
        print("=" * 50)
        
        if not services:
            self.log_result(
                "Services Data Quality",
                False,
                "No services available for quality testing"
            )
        else:
            # Test service descriptions
            meaningful_descriptions = 0
            for service in services:
                description = service.get("description", "")
                if len(description) > 20:  # Meaningful description threshold
                    meaningful_descriptions += 1
            
            description_percentage = (meaningful_descriptions / len(services)) * 100
            self.log_result(
                "Service Descriptions Quality",
                description_percentage >= 80,  # 80% should have meaningful descriptions
                f"{meaningful_descriptions}/{len(services)} services ({description_percentage:.1f}%) have meaningful descriptions",
                {"threshold": "80%", "actual": f"{description_percentage:.1f}%"}
            )
            
            # Test pricing data
            services_with_price = sum(1 for s in services if s.get("fixed_price", 0) > 0)
            price_percentage = (services_with_price / len(services)) * 100
            self.log_result(
                "Service Pricing Data",
                price_percentage >= 95,  # 95% should have valid pricing
                f"{services_with_price}/{len(services)} services ({price_percentage:.1f}%) have valid pricing",
                {"threshold": "95%", "actual": f"{price_percentage:.1f}%"}
            )
        
        if not handlers:
            self.log_result(
                "Handlers Data Quality",
                False,
                "No handlers available for quality testing"
            )
        else:
            # Test handler skills
            handlers_with_skills = sum(1 for h in handlers if h.get("skills") and len(h.get("skills", [])) > 0)
            skills_percentage = (handlers_with_skills / len(handlers)) * 100
            self.log_result(
                "Handler Skills Data",
                skills_percentage >= 90,  # 90% should have skills
                f"{handlers_with_skills}/{len(handlers)} handlers ({skills_percentage:.1f}%) have skills defined",
                {"threshold": "90%", "actual": f"{skills_percentage:.1f}%"}
            )
            
            # Test handler ratings
            valid_ratings = 0
            for handler in handlers:
                rating = handler.get("rating", 0)
                if isinstance(rating, (int, float)) and 0 <= rating <= 5:
                    valid_ratings += 1
            
            rating_percentage = (valid_ratings / len(handlers)) * 100
            self.log_result(
                "Handler Ratings Validity",
                rating_percentage >= 95,  # 95% should have valid ratings
                f"{valid_ratings}/{len(handlers)} handlers ({rating_percentage:.1f}%) have valid ratings (0-5)",
                {"threshold": "95%", "actual": f"{rating_percentage:.1f}%"}
            )
            
            # Test availability status
            handlers_with_availability = sum(1 for h in handlers if isinstance(h.get("available"), bool))
            availability_percentage = (handlers_with_availability / len(handlers)) * 100
            self.log_result(
                "Handler Availability Status",
                availability_percentage >= 95,  # 95% should have boolean availability
                f"{handlers_with_availability}/{len(handlers)} handlers ({availability_percentage:.1f}%) have boolean availability status",
                {"threshold": "95%", "actual": f"{availability_percentage:.1f}%"}
            )
    
    def test_advanced_search_scenarios(self):
        """Test advanced search scenarios"""
        print("\n🔍 ADVANCED SEARCH SCENARIOS")
        print("=" * 50)
        
        # Test handler filtering by skill
        response = self.make_request("/handlers", params={"skill": "Cleaning"})
        if response and "error" not in response:
            if isinstance(response, list):
                cleaning_handlers = len(response)
                self.log_result(
                    "Handler Skill Filtering",
                    True,
                    f"Successfully filtered {cleaning_handlers} handlers with 'Cleaning' skill"
                )
            else:
                self.log_result(
                    "Handler Skill Filtering",
                    False,
                    "Response is not a list"
                )
        else:
            self.log_result(
                "Handler Skill Filtering",
                False,
                "Failed to filter handlers by skill"
            )
        
        # Test handler availability filtering
        response = self.make_request("/handlers", params={"available": "true"})
        if response and "error" not in response:
            if isinstance(response, list):
                available_handlers = len(response)
                self.log_result(
                    "Handler Availability Filtering",
                    True,
                    f"Successfully filtered {available_handlers} available handlers"
                )
            else:
                self.log_result(
                    "Handler Availability Filtering",
                    False,
                    "Response is not a list"
                )
        else:
            self.log_result(
                "Handler Availability Filtering",
                False,
                "Failed to filter handlers by availability"
            )
    
    def run_all_tests(self):
        """Run all search and advanced search tests"""
        print("🚀 STARTING SEARCH & ADVANCED SEARCH API TESTING")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # PRIORITY 1: Core Search APIs
        services = self.test_services_endpoint()
        categories = self.test_categories_endpoint()
        handlers = self.test_handlers_endpoint()
        
        # PRIORITY 2: Search Filtering
        if categories:
            self.test_category_filtering(categories)
        
        # PRIORITY 3: Data Quality
        if services and handlers:
            self.test_data_quality(services, handlers)
        
        # Advanced Search Scenarios
        self.test_advanced_search_scenarios()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests} ✅")
        print(f"Failed: {self.failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({self.failed_tests}):")
            for result in self.results:
                if "❌ FAIL" in result["status"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        
        # Determine overall status
        if success_rate >= 90:
            print("🎉 OVERALL STATUS: EXCELLENT - Search APIs are fully functional!")
        elif success_rate >= 75:
            print("✅ OVERALL STATUS: GOOD - Search APIs are mostly functional with minor issues")
        elif success_rate >= 50:
            print("⚠️  OVERALL STATUS: NEEDS ATTENTION - Several search API issues found")
        else:
            print("❌ OVERALL STATUS: CRITICAL - Major search API issues require immediate attention")

def main():
    """Main test execution"""
    tester = SearchAPITester()
    tester.run_all_tests()
    
    # Return exit code based on results
    if tester.failed_tests == 0:
        sys.exit(0)  # All tests passed
    else:
        sys.exit(1)  # Some tests failed

if __name__ == "__main__":
    main()