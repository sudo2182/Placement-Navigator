"""
Test suite for Companies CRUD endpoints
"""

import pytest
import sys
import os
sys.path.append('../')

from fastapi.testclient import TestClient
from backend.main import app
from shared.models import get_db, Company, User
from backend.auth import get_password_hash, create_access_token

client = TestClient(app)

@pytest.fixture
def test_db():
    """Create test database session"""
    from shared.models import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def tpo_token():
    """Create test TPO user and token"""
    # In real implementation, create test user and return token
    return "test_token"

def test_create_company(test_db, tpo_token):
    """Test creating a company"""
    company_data = {
        "name": "Test Company",
        "website": "https://test.com",
        "sector": "Software",
        "hq_location": "San Francisco, USA",
        "point_of_contact": "hr@test.com"
    }
    
    response = client.post(
        "/companies/",
        json=company_data,
        headers={"Authorization": f"Bearer {tpo_token}"}
    )
    
    assert response.status_code == 200 or response.status_code == 201
    data = response.json()
    assert data["name"] == company_data["name"]
    assert data["sector"] == company_data["sector"]

def test_list_companies(test_db):
    """Test listing companies"""
    response = client.get("/companies/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_company(test_db):
    """Test getting a specific company"""
    # First create a company, then get it
    company_data = {
        "name": "Test Company 2",
        "sector": "Technology"
    }
    
    create_response = client.post("/companies/", json=company_data)
    company_id = create_response.json()["id"]
    
    response = client.get(f"/companies/{company_id}")
    assert response.status_code == 200
    assert response.json()["name"] == company_data["name"]

def test_update_company(test_db, tpo_token):
    """Test updating a company"""
    # Create company first
    company_data = {"name": "Original Name"}
    create_response = client.post("/companies/", json=company_data)
    company_id = create_response.json()["id"]
    
    # Update it
    update_data = {"name": "Updated Name", "sector": "New Sector"}
    response = client.put(
        f"/companies/{company_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {tpo_token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]

def test_delete_company(test_db, tpo_token):
    """Test deleting a company"""
    # Create company first
    company_data = {"name": "To Delete"}
    create_response = client.post("/companies/", json=company_data)
    company_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(
        f"/companies/{company_id}",
        headers={"Authorization": f"Bearer {tpo_token}"}
    )
    
    assert response.status_code == 200
    assert "message" in response.json()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

