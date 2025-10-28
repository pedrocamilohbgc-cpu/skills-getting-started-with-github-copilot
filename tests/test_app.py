from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_success():
    response = client.post("/activities/Chess Club/signup?email=testuser@school.edu")
    assert response.status_code == 200
    assert "Signed up" in response.json()["message"]

def test_signup_duplicate():
    client.post("/activities/Chess Club/signup?email=testuser@school.edu")
    response = client.post("/activities/Chess Club/signup?email=testuser@school.edu")
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already registered for this activity."