import base64
import io
import os
from typing import Dict, List, Any
import google.generativeai as genai
from PIL import Image
import PyPDF2
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()


def process_bank_statement(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Process bank statement using Gemini AI to extract transactions, expenses, and income.

    Args:
        file_content: The file content as bytes
        filename: The name of the uploaded file

    Returns:
        Dictionary containing structured bank statement data
    """
    # Initialize Gemini
    # Note: Set GEMINI_API_KEY environment variable
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    genai.configure(api_key=api_key)

    # Determine file type and prepare content for Gemini
    file_ext = filename.lower().split(".")[-1]

    if file_ext == "pdf":
        # Extract text from PDF
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n"

        # For PDFs, we'll use text-based processing
        prompt = f"""Analyze the following bank statement text and extract all transactions, expenses, and income.

Bank Statement Text:
{text_content}

Please extract and return a JSON object with the following structure:
{{
    "transactions": [
        {{
            "date": "YYYY-MM-DD",
            "description": "transaction description",
            "amount": 0.00,
            "type": "expense" or "income"
        }}
    ],
    "totalExpenses": 0.00,
    "totalIncome": 0.00,
    "period": "statement period if available"
}}

Only return valid JSON, no additional text."""

        # Use gemini-2.5-flash for text processing (best free model with vision support)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

    else:
        # For images, use gemini-2.5-flash which supports vision
        image = Image.open(io.BytesIO(file_content))

        prompt = """Analyze this bank statement image and extract all transactions, expenses, and income.

Please extract and return a JSON object with the following structure:
{
    "transactions": [
        {
            "date": "YYYY-MM-DD",
            "description": "transaction description",
            "amount": 0.00,
            "type": "expense" or "income"
        }
    ],
    "totalExpenses": 0.00,
    "totalIncome": 0.00,
    "period": "statement period if available"
}

Only return valid JSON, no additional text."""

        # Use gemini-2.5-flash for vision (best free model with vision support)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content([prompt, image])

    # Parse the response
    response_text = response.text.strip()

    # Try to extract JSON from the response (Gemini might add markdown formatting)
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    import json

    try:
        result = json.loads(response_text)

        # Validate and structure the response
        transactions = result.get("transactions", [])
        total_expenses = result.get("totalExpenses", 0.0)
        total_income = result.get("totalIncome", 0.0)
        period = result.get("period", "")

        # Calculate totals if not provided
        if not total_expenses or not total_income:
            total_expenses = sum(
                t.get("amount", 0) for t in transactions if t.get("type") == "expense"
            )
            total_income = sum(
                t.get("amount", 0) for t in transactions if t.get("type") == "income"
            )

        return {
            "transactions": transactions,
            "totalExpenses": float(total_expenses),
            "totalIncome": float(total_income),
            "period": period,
        }
    except json.JSONDecodeError as e:
        # Fallback: return error structure
        return {
            "error": f"Failed to parse Gemini response: {str(e)}",
            "raw_response": response_text,
            "transactions": [],
            "totalExpenses": 0.0,
            "totalIncome": 0.0,
            "period": "",
        }
