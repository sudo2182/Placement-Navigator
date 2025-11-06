"""
Test suite for Bulk Upload endpoint
"""

import pytest
import sys
import os
import csv
import io
sys.path.append('../')

from fastapi.testclient import TestClient
from backend.main import app
from shared.models import get_db, User

client = TestClient(app)

@pytest.fixture
def tpo_token():
    """Create test TPO user and token"""
    # In real implementation, create test user and return token
    return "test_token"

def test_bulk_upload_csv(test_db, tpo_token):
    """Test bulk uploading students from CSV"""
    # Create CSV content
    csv_content = """email,sapid,name,branch,cgpa,backlogs,year,phone,city
student1@test.edu,60004210001,John Doe,Computer Science,8.5,0,Final Year,9876543210,Mumbai
student2@test.edu,60004210002,Jane Smith,IT,8.2,0,Final Year,9876543211,Delhi"""
    
    csv_file = io.BytesIO(csv_content.encode('utf-8'))
    
    response = client.post(
        "/profiles/bulk-upload",
        files={"file": ("test.csv", csv_file, "text/csv")},
        headers={"Authorization": f"Bearer {tpo_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "imported" in data
    assert "duplicates" in data
    assert "errors" in data
    assert "results" in data
    assert data["imported"] >= 0

def test_bulk_upload_invalid_format(test_db, tpo_token):
    """Test bulk upload with invalid file format"""
    response = client.post(
        "/profiles/bulk-upload",
        files={"file": ("test.txt", io.BytesIO(b"test content"), "text/plain")},
        headers={"Authorization": f"Bearer {tpo_token}"}
    )
    
    assert response.status_code == 400

def test_bulk_upload_duplicate_email(test_db, tpo_token):
    """Test bulk upload handles duplicate emails"""
    # First upload
    csv_content1 = "email,sapid,name\nstudent@test.edu,60004210001,Student One"
    csv_file1 = io.BytesIO(csv_content1.encode('utf-8'))
    client.post("/profiles/bulk-upload", files={"file": ("test1.csv", csv_file1, "text/csv")})
    
    # Second upload with same email
    csv_content2 = "email,sapid,name\nstudent@test.edu,60004210002,Student Two"
    csv_file2 = io.BytesIO(csv_content2.encode('utf-8'))
    response = client.post("/profiles/bulk-upload", files={"file": ("test2.csv", csv_file2, "text/csv")})
    
    assert response.status_code == 200
    data = response.json()
    assert data["duplicates"] >= 1

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

