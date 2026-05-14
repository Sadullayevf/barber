import json
import urllib.request
import urllib.parse

BASE_URL = "http://127.0.0.1:8000"

def request(url, method="GET", data=None, headers=None, is_form=False):
    if headers is None:
        headers = {}
    
    body = None
    if data:
        if is_form:
            body = urllib.parse.urlencode(data).encode("utf-8")
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            body = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
            
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))

def test():
    try:
        # 1. Login
        print("Logging in...")
        admin = request(f"{BASE_URL}/login", "POST", {"email": "admin@gmail.com", "password": "admin123"}, is_form=False)
        token = admin["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Register
        print("Registering...")
        user = request(f"{BASE_URL}/register", "POST", {"name": "URLLIB Barber", "email": "urllib@gmail.com", "password": "password123"})
        user_id = user["id"]

        # 3. Update role
        print(f"Updating role for user {user_id}...")
        request(f"{BASE_URL}/users/{user_id}/role", "PUT", {"role": "barber"}, headers=headers)

        # 4. Verify
        print("Verifying...")
        barbers = request(f"{BASE_URL}/barbers")
        match = [b for b in barbers if b["name"] == "URLLIB Barber"]
        if match:
            print(f"Success! Barber found: {match[0]}")
        else:
            print("Failure: Barber not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
