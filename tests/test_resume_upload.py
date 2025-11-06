"""
Unit tests for resume upload endpoint
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import UploadFile
import io
import os
import sys
from unittest.mock import Mock, patch, MagicMock

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.main import app
from shared.models import Base, ResumeUpload, User
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.auth import create_access_token

# Test database (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test tables
Base.metadata.create_all(bind=engine)

@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    from backend.auth import get_password_hash
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpass123"),
        role="student",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture
def auth_headers(test_user):
    """Generate auth token for test user"""
    token = create_access_token({"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}

def create_pdf_content(text_content: str = "Sample resume text\nName: Test User\nEmail: test@example.com") -> bytes:
    """Create a simple PDF file content for testing"""
    # This is a minimal valid PDF structure
    # In real tests, you might want to use a library like reportlab to generate proper PDFs
    # For now, we'll create a minimal PDF that PyMuPDF can read
    pdf_header = b"%PDF-1.4\n"
    pdf_body = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    pdf_body += b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    pdf_body += b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n"
    pdf_body += b"4 0 obj\n<< /Length 100 >>\nstream\n"
    pdf_body += text_content.encode('utf-8')
    pdf_body += b"\nendstream\nendobj\n"
    pdf_body += b"xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000201 00000 n \n"
    pdf_body += b"trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n300\n%%EOF"
    
    return pdf_header + pdf_body

def create_invalid_pdf() -> bytes:
    """Create invalid PDF content"""
    return b"This is not a PDF file"

@pytest.mark.asyncio
async def test_upload_valid_pdf(client, auth_headers, test_user, db_session):
    """Test uploading a valid PDF resume"""
    
    # Create a valid PDF
    pdf_content = create_pdf_content("Test Resume\nJohn Doe\nSoftware Engineer")
    
    # Mock storage service
    with patch('backend.routers.resumes.storage_service.upload_file') as mock_upload:
        mock_upload.return_value = True
        
        # Mock PDF extractor
        with patch('backend.routers.resumes.pdf_extractor.extract_text') as mock_extract:
            mock_extract.return_value = ("Test Resume\nJohn Doe\nSoftware Engineer", 40, 1)
            
            with patch('backend.routers.resumes.pdf_extractor.validate_pdf') as mock_validate:
                mock_validate.return_value = True
                
                # Create upload file
                files = {
                    "file": ("resume.pdf", io.BytesIO(pdf_content), "application/pdf")
                }
                
                response = client.post(
                    "/api/v1/resumes/upload",
                    files=files,
                    headers=auth_headers
                )
                
                assert response.status_code == 200
                data = response.json()
                assert "upload_id" in data
                assert "file_key" in data
                assert data["chars"] == 40
                assert data["pages"] == 1
                assert "resumes/" in data["file_key"]
                
                # Verify database record
                upload_record = db_session.query(ResumeUpload).filter(
                    ResumeUpload.id == data["upload_id"]
                ).first()
                assert upload_record is not None
                assert upload_record.user_id == test_user.id
                assert upload_record.file_key == data["file_key"]
                assert mock_upload.called

@pytest.mark.asyncio
async def test_upload_non_pdf_rejected(client, auth_headers):
    """Test that non-PDF files are rejected"""
    
    # Create a text file
    text_content = b"This is not a PDF file"
    
    files = {
        "file": ("resume.txt", io.BytesIO(text_content), "text/plain")
    }
    
    response = client.post(
        "/api/v1/resumes/upload",
        files=files,
        headers=auth_headers
    )
    
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"] or "Invalid MIME type" in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_file_too_large(client, auth_headers):
    """Test that files larger than 5MB are rejected"""
    
    # Create a large file (6MB)
    large_content = b"x" * (6 * 1024 * 1024)
    
    files = {
        "file": ("large.pdf", io.BytesIO(large_content), "application/pdf")
    }
    
    with patch('backend.routers.resumes.pdf_extractor.validate_pdf') as mock_validate:
        mock_validate.return_value = True
        
        response = client.post(
            "/api/v1/resumes/upload",
            files=files,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "exceeds maximum" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_upload_empty_pdf(client, auth_headers, test_user):
    """Test uploading an empty PDF (scanned PDF with no text)"""
    
    pdf_content = create_pdf_content("")  # Empty content
    
    with patch('backend.routers.resumes.storage_service.upload_file') as mock_upload:
        mock_upload.return_value = True
        
        with patch('backend.routers.resumes.pdf_extractor.extract_text') as mock_extract:
            mock_extract.return_value = ("", 0, 1)  # Empty text, 0 chars, 1 page
            
            with patch('backend.routers.resumes.pdf_extractor.validate_pdf') as mock_validate:
                mock_validate.return_value = True
                
                files = {
                    "file": ("empty.pdf", io.BytesIO(pdf_content), "application/pdf")
                }
                
                response = client.post(
                    "/api/v1/resumes/upload",
                    files=files,
                    headers=auth_headers
                )
                
                # Should not fail even with empty text
                assert response.status_code == 200
                data = response.json()
                assert data["chars"] == 0
                assert data["pages"] == 1

@pytest.mark.asyncio
async def test_upload_invalid_pdf_format(client, auth_headers):
    """Test uploading invalid PDF format"""
    
    invalid_pdf = create_invalid_pdf()
    
    with patch('backend.routers.resumes.pdf_extractor.validate_pdf') as mock_validate:
        mock_validate.return_value = False
        
        files = {
            "file": ("invalid.pdf", io.BytesIO(invalid_pdf), "application/pdf")
        }
        
        response = client.post(
            "/api/v1/resumes/upload",
            files=files,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "Invalid PDF" in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_unauthorized(client):
    """Test that unauthenticated requests are rejected"""
    
    pdf_content = create_pdf_content()
    
    files = {
        "file": ("resume.pdf", io.BytesIO(pdf_content), "application/pdf")
    }
    
    response = client.post(
        "/api/v1/resumes/upload",
        files=files
    )
    
    assert response.status_code == 403  # FastAPI returns 403 for missing auth


