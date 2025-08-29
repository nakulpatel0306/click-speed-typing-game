import requests
import sys
import json
from datetime import datetime

class TypeRacerAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.status_code == 200 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_practice_text_default(self):
        """Test getting practice text with default difficulty"""
        return self.run_test("Practice Text (Default)", "GET", "api/practice-text", 200)

    def test_practice_text_easy(self):
        """Test getting practice text with easy difficulty"""
        return self.run_test("Practice Text (Easy)", "GET", "api/practice-text", 200, params={"difficulty": "easy"})

    def test_practice_text_medium(self):
        """Test getting practice text with medium difficulty"""
        return self.run_test("Practice Text (Medium)", "GET", "api/practice-text", 200, params={"difficulty": "medium"})

    def test_practice_text_hard(self):
        """Test getting practice text with hard difficulty"""
        return self.run_test("Practice Text (Hard)", "GET", "api/practice-text", 200, params={"difficulty": "hard"})

    def test_practice_text_invalid(self):
        """Test getting practice text with invalid difficulty (should default to medium)"""
        return self.run_test("Practice Text (Invalid)", "GET", "api/practice-text", 200, params={"difficulty": "invalid"})

    def test_save_result(self):
        """Test saving a typing result"""
        result_data = {
            "user_id": "test_user_123",
            "wpm": 45.5,
            "accuracy": 92.3,
            "time_taken": 120.5,
            "characters_typed": 150,
            "mistakes": 12,
            "text_length": 162,
            "timestamp": datetime.utcnow().isoformat()
        }
        return self.run_test("Save Result", "POST", "api/results", 200, data=result_data)

    def test_save_result_minimal(self):
        """Test saving a result with minimal required fields"""
        result_data = {
            "wpm": 30.0,
            "accuracy": 85.0,
            "time_taken": 180.0,
            "characters_typed": 100,
            "mistakes": 15,
            "text_length": 120,
            "timestamp": datetime.utcnow().isoformat()
        }
        return self.run_test("Save Result (Minimal)", "POST", "api/results", 200, data=result_data)

    def test_get_stats_no_user(self):
        """Test getting global stats"""
        return self.run_test("Get Stats (Global)", "GET", "api/stats", 200)

    def test_get_stats_with_user(self):
        """Test getting stats for specific user"""
        return self.run_test("Get Stats (User)", "GET", "api/stats", 200, params={"user_id": "test_user_123"})

def main():
    print("🚀 Starting TypeRacer AI Backend API Tests")
    print("=" * 50)
    
    # Setup
    tester = TypeRacerAPITester()

    # Run all tests
    print("\n📋 Testing Core Endpoints...")
    tester.test_root_endpoint()
    
    print("\n📝 Testing Practice Text Endpoints...")
    tester.test_practice_text_default()
    tester.test_practice_text_easy()
    tester.test_practice_text_medium()
    tester.test_practice_text_hard()
    tester.test_practice_text_invalid()
    
    print("\n💾 Testing Results Endpoints...")
    tester.test_save_result()
    tester.test_save_result_minimal()
    
    print("\n📊 Testing Stats Endpoints...")
    tester.test_get_stats_no_user()
    tester.test_get_stats_with_user()

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())