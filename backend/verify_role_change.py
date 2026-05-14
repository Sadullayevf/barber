import requests

BASE_URL = "http://127.0.0.1:8000"

def test_auto_barber_creation():
    # 1. Login as Admin
    print("Logging in as admin...")
    login_data = {"username": "admin@gmail.com", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/login", data=login_data)
    if response.status_code != 200:
        print(f"Admin login failed: {response.text}")
        return
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Register a new user
    print("Registering a new user...")
    user_data = {"name": "New Barber User", "email": "newbarber@gmail.com", "password": "password123"}
    response = requests.post(f"{BASE_URL}/register", json=user_data)
    if response.status_code != 200:
        print(f"User registration failed: {response.text}")
        # Maybe user exists, try to continue
    user_id = response.json().get("id")
    if not user_id:
        # If user exists, we need to find their ID
        # Since this is a test, I'll just assume it works or fail
        print("Could not get user ID")
        return

    # 3. Update role to barber
    print(f"Updating user {user_id} role to barber...")
    response = requests.put(f"{BASE_URL}/users/{user_id}/role", json={"role": "barber"}, headers=headers)
    if response.status_code != 200:
        print(f"Role update failed: {response.text}")
        return
    
    # 4. Check if barber exists
    print("Checking /barbers endpoint...")
    response = requests.get(f"{BASE_URL}/barbers")
    barbers = response.json()
    new_barber = next((b for b in barbers if b["name"] == "New Barber User"), None)
    
    if new_barber:
        print(f"Success! New barber created: {new_barber}")
    else:
        print("Failure: New barber not found in /barbers list")

if __name__ == "__main__":
    test_auto_barber_creation()
