import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root_redirect():
    response = client.get("/")
    assert response.status_code in (200, 307, 308)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert all("description" in v for v in data.values())

def test_signup_and_unregister():
    # Get an activity name
    response = client.get("/activities")
    activities = response.json()
    activity_name = next(iter(activities))
    test_email = "pytest-student@mergington.edu"

    # Sign up
    signup = client.post(f"/activities/{activity_name}/signup?email={test_email}")
    assert signup.status_code == 200
    assert "message" in signup.json()

    # Unregister
    unregister = client.post(f"/activities/{activity_name}/unregister?email={test_email}")
    assert unregister.status_code == 200
    assert "message" in unregister.json()