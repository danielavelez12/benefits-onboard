import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Benefits Onboard API"}


def test_health():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_upload_bank_statement_invalid_file_type():
    """Test upload endpoint with invalid file type"""
    # Create a fake file with invalid extension
    files = {"file": ("test.txt", b"fake content", "text/plain")}
    response = client.post("/api/upload-bank-statement", files=files)
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_upload_bank_statement_no_file():
    """Test upload endpoint without file"""
    response = client.post("/api/upload-bank-statement")
    assert response.status_code == 422  # Validation error


def test_upload_bank_statement_valid_pdf():
    """Test upload endpoint with valid PDF file"""
    # Create a minimal PDF file content
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 0\ntrailer\n<<\n/Size 0\n/Root 1 0 R\n>>\nstartxref\n0\n%%EOF"
    files = {"file": ("test.pdf", pdf_content, "application/pdf")}

    # This will fail without GEMINI_API_KEY, but we can test the file validation
    response = client.post("/api/upload-bank-statement", files=files)
    # Should either succeed (if API key is set) or fail with API error (not file validation error)
    assert response.status_code in [200, 500]
    if response.status_code == 500:
        # Should be an API error, not a file validation error
        assert "Invalid file type" not in response.json().get("detail", "")


def test_upload_bank_statement_valid_image():
    """Test upload endpoint with valid image file"""
    # Create a minimal PNG file (PNG signature)
    png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde"
    files = {"file": ("test.png", png_content, "image/png")}

    response = client.post("/api/upload-bank-statement", files=files)
    # Should either succeed (if API key is set) or fail with API error
    assert response.status_code in [200, 500]
    if response.status_code == 500:
        assert "Invalid file type" not in response.json().get("detail", "")
