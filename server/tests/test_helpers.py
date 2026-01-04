import pytest
import os
from unittest.mock import patch, MagicMock
from app.helpers import process_bank_statement


def test_process_bank_statement_missing_api_key():
    """Test that process_bank_statement raises error when API key is missing"""
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(ValueError, match="GEMINI_API_KEY"):
            process_bank_statement(b"fake content", "test.pdf")


@patch("app.helpers.genai")
@patch("app.helpers.PyPDF2.PdfReader")
def test_process_bank_statement_pdf(mock_pdf_reader, mock_genai):
    """Test process_bank_statement with PDF file"""
    # Mock PDF reader
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Sample bank statement text"
    mock_pdf_reader.return_value.pages = [mock_page]

    # Mock the Gemini API
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = """{
        "transactions": [
            {
                "date": "2024-01-15",
                "description": "Grocery Store",
                "amount": 125.50,
                "type": "expense"
            },
            {
                "date": "2024-01-20",
                "description": "Salary",
                "amount": 5000.00,
                "type": "income"
            }
        ],
        "totalExpenses": 125.50,
        "totalIncome": 5000.00,
        "period": "January 2024"
    }"""
    mock_model.generate_content.return_value = mock_response
    mock_genai.GenerativeModel.return_value = mock_model
    mock_genai.configure = MagicMock()

    # Mock environment variable
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
        # Create minimal PDF content
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 0\ntrailer\n<<\n/Size 0\n/Root 1 0 R\n>>\nstartxref\n0\n%%EOF"

        result = process_bank_statement(pdf_content, "test.pdf")

        assert "transactions" in result
        assert len(result["transactions"]) == 2
        assert result["totalExpenses"] == 125.50
        assert result["totalIncome"] == 5000.00
        assert result["period"] == "January 2024"
        assert result["transactions"][0]["type"] == "expense"
        assert result["transactions"][1]["type"] == "income"


@patch("app.helpers.genai")
@patch("app.helpers.Image")
def test_process_bank_statement_image(mock_image, mock_genai):
    """Test process_bank_statement with image file"""
    # Mock the Gemini API
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = """{
        "transactions": [
            {
                "date": "2024-01-15",
                "description": "Coffee Shop",
                "amount": 5.50,
                "type": "expense"
            }
        ],
        "totalExpenses": 5.50,
        "totalIncome": 0.00,
        "period": "January 2024"
    }"""
    mock_model.generate_content.return_value = mock_response
    mock_genai.GenerativeModel.return_value = mock_model
    mock_genai.configure = MagicMock()

    # Mock PIL Image
    mock_img = MagicMock()
    mock_image.open.return_value = mock_img

    # Mock environment variable
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
        image_content = b"fake image content"

        result = process_bank_statement(image_content, "test.png")

        assert "transactions" in result
        assert len(result["transactions"]) == 1
        assert result["totalExpenses"] == 5.50
        assert result["totalIncome"] == 0.00


@patch("app.helpers.genai")
@patch("app.helpers.PyPDF2.PdfReader")
def test_process_bank_statement_json_parsing_error(mock_pdf_reader, mock_genai):
    """Test process_bank_statement with invalid JSON response"""
    # Mock PDF reader
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Sample bank statement text"
    mock_pdf_reader.return_value.pages = [mock_page]

    # Mock the Gemini API to return invalid JSON
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "This is not valid JSON"
    mock_model.generate_content.return_value = mock_response
    mock_genai.GenerativeModel.return_value = mock_model
    mock_genai.configure = MagicMock()

    # Mock environment variable
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 0\ntrailer\n<<\n/Size 0\n/Root 1 0 R\n>>\nstartxref\n0\n%%EOF"

        result = process_bank_statement(pdf_content, "test.pdf")

        # Should return error structure
        assert "error" in result
        assert result["transactions"] == []
        assert result["totalExpenses"] == 0.0
        assert result["totalIncome"] == 0.0


@patch("app.helpers.genai")
@patch("app.helpers.PyPDF2.PdfReader")
def test_process_bank_statement_calculates_totals(mock_pdf_reader, mock_genai):
    """Test that process_bank_statement calculates totals if not provided"""
    # Mock PDF reader
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Sample bank statement text"
    mock_pdf_reader.return_value.pages = [mock_page]

    # Mock the Gemini API response without totals
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = """{
        "transactions": [
            {
                "date": "2024-01-15",
                "description": "Expense 1",
                "amount": 100.00,
                "type": "expense"
            },
            {
                "date": "2024-01-20",
                "description": "Income 1",
                "amount": 200.00,
                "type": "income"
            }
        ],
        "period": "January 2024"
    }"""
    mock_model.generate_content.return_value = mock_response
    mock_genai.GenerativeModel.return_value = mock_model
    mock_genai.configure = MagicMock()

    # Mock environment variable
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}):
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 0\ntrailer\n<<\n/Size 0\n/Root 1 0 R\n>>\nstartxref\n0\n%%EOF"

        result = process_bank_statement(pdf_content, "test.pdf")

        # Should calculate totals from transactions
        assert result["totalExpenses"] == 100.00
        assert result["totalIncome"] == 200.00
