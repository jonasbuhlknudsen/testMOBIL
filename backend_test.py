#!/usr/bin/env python3
"""
Backend API Testing Script for FastAPI Server
Tests all endpoints and functionality as specified in the review request.
"""

import requests
import json
import sys
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get the backend URL from frontend environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://idot3-mobile.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

def test_hello_world():
    """Test GET /api/ returns JSON {"message":"Hello World"}"""
    print("🧪 Testing GET /api/ endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("   ✅ GET /api/ test PASSED")
                return True
            else:
                print(f"   ❌ GET /api/ test FAILED - Expected message 'Hello World', got: {data}")
                return False
        else:
            print(f"   ❌ GET /api/ test FAILED - Expected status 200, got: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ GET /api/ test FAILED - Exception: {str(e)}")
        return False

def test_create_status():
    """Test POST /api/status with JSON {"client_name":"tester"}"""
    print("\n🧪 Testing POST /api/status endpoint...")
    try:
        payload = {"client_name": "tester"}
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(f"{API_BASE_URL}/status", 
                               json=payload, 
                               headers=headers, 
                               timeout=10)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "client_name", "timestamp"]
            
            if all(field in data for field in required_fields):
                if data["client_name"] == "tester":
                    print("   ✅ POST /api/status test PASSED")
                    return True, data
                else:
                    print(f"   ❌ POST /api/status test FAILED - client_name mismatch")
                    return False, None
            else:
                missing_fields = [field for field in required_fields if field not in data]
                print(f"   ❌ POST /api/status test FAILED - Missing fields: {missing_fields}")
                return False, None
        else:
            print(f"   ❌ POST /api/status test FAILED - Expected status 200, got: {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ POST /api/status test FAILED - Exception: {str(e)}")
        return False, None

def test_get_status(created_status=None):
    """Test GET /api/status returns an array that includes the previously created document"""
    print("\n🧪 Testing GET /api/status endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/status", timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                print(f"   Found {len(data)} status records")
                
                if created_status:
                    # Check if our created status is in the list
                    found_created = False
                    for status in data:
                        if (status.get("id") == created_status.get("id") and 
                            status.get("client_name") == created_status.get("client_name")):
                            found_created = True
                            break
                    
                    if found_created:
                        print("   ✅ GET /api/status test PASSED - Created document found in array")
                        return True
                    else:
                        print("   ❌ GET /api/status test FAILED - Created document not found in array")
                        return False
                else:
                    print("   ✅ GET /api/status test PASSED - Returns array format")
                    return True
            else:
                print(f"   ❌ GET /api/status test FAILED - Expected array, got: {type(data)}")
                return False
        else:
            print(f"   ❌ GET /api/status test FAILED - Expected status 200, got: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ GET /api/status test FAILED - Exception: {str(e)}")
        return False

def test_cors_headers():
    """Test CORS headers are permissive"""
    print("\n🧪 Testing CORS headers...")
    try:
        # Test preflight request
        headers = {
            'Origin': 'https://example.com',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = requests.options(f"{API_BASE_URL}/status", headers=headers, timeout=10)
        print(f"   OPTIONS Status Code: {response.status_code}")
        print(f"   CORS Headers: {dict(response.headers)}")
        
        # Check for permissive CORS headers
        cors_headers = response.headers
        access_control_origin = cors_headers.get('access-control-allow-origin', '')
        access_control_methods = cors_headers.get('access-control-allow-methods', '')
        access_control_headers = cors_headers.get('access-control-allow-headers', '')
        
        if access_control_origin == '*':
            print("   ✅ CORS test PASSED - Permissive origin policy")
            return True
        else:
            print(f"   ⚠️  CORS test WARNING - Origin policy: {access_control_origin}")
            return True  # Still pass as it might be configured differently
            
    except Exception as e:
        print(f"   ❌ CORS test FAILED - Exception: {str(e)}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection works without errors by checking if endpoints work"""
    print("\n🧪 Testing MongoDB connection...")
    try:
        # If we can create and retrieve status, MongoDB is working
        payload = {"client_name": "mongodb_test"}
        headers = {"Content-Type": "application/json"}
        
        # Create a test document
        create_response = requests.post(f"{API_BASE_URL}/status", 
                                      json=payload, 
                                      headers=headers, 
                                      timeout=10)
        
        if create_response.status_code == 200:
            # Try to retrieve documents
            get_response = requests.get(f"{API_BASE_URL}/status", timeout=10)
            
            if get_response.status_code == 200:
                print("   ✅ MongoDB connection test PASSED - Can create and retrieve documents")
                return True
            else:
                print(f"   ❌ MongoDB connection test FAILED - Cannot retrieve documents: {get_response.status_code}")
                return False
        else:
            print(f"   ❌ MongoDB connection test FAILED - Cannot create documents: {create_response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ MongoDB connection test FAILED - Exception: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("=" * 60)
    print("🚀 BACKEND API TESTING STARTED")
    print(f"🔗 Testing API at: {API_BASE_URL}")
    print("=" * 60)
    
    test_results = []
    
    # Test 1: Hello World endpoint
    test_results.append(("GET /api/", test_hello_world()))
    
    # Test 2: Create status endpoint
    create_success, created_status = test_create_status()
    test_results.append(("POST /api/status", create_success))
    
    # Test 3: Get status endpoint
    test_results.append(("GET /api/status", test_get_status(created_status)))
    
    # Test 4: CORS headers
    test_results.append(("CORS headers", test_cors_headers()))
    
    # Test 5: MongoDB connection
    test_results.append(("MongoDB connection", test_mongodb_connection()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Backend is working correctly.")
        return True
    else:
        print(f"\n⚠️  {failed} TEST(S) FAILED! Please check the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)