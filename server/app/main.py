from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.bank_statement_processing import process_bank_statement
from app.helpers import (
    read_csv_transactions,
    format_transactions_for_plaid,
    enrich_transactions_with_plaid,
    merge_enriched_data,
)
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Benefits Onboard API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to Benefits Onboard API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/upload-bank-statement")
async def upload_bank_statement(file: UploadFile = File(...)):
    """
    Upload and process a bank statement document.
    Accepts PDF or image files (PNG, JPG, JPEG).
    """
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg"}
    file_ext = (
        "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    )

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}",
        )

    try:
        # Read file content
        file_content = await file.read()

        # Process bank statement using Gemini
        result = process_bank_statement(file_content, file.filename)

        # Check for processing errors
        if result.error:
            raise HTTPException(
                status_code=500,
                detail=result.error,
            )

        # Convert BankStatementResult to dict for JSON response
        return result.to_dict()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing bank statement: {str(e)}"
        )


@app.post("/api/enrich-transactions")
async def enrich_transactions():
    """
    Enrich transactions from CSV file using Plaid's enrich API.
    Returns transactions with enriched metadata.
    """
    try:
        print("=" * 50)
        print("ENRICH TRANSACTIONS ENDPOINT CALLED")
        print("=" * 50)

        # Get the path to the CSV file
        csv_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "enrich_sandbox_preset_transactions.csv",
        )

        # Read transactions from CSV
        base_transactions = read_csv_transactions(csv_path)
        print(f"Read {len(base_transactions)} transactions from CSV")

        # Format transactions for Plaid API
        plaid_transactions = format_transactions_for_plaid(base_transactions)
        print(f"Formatted {len(plaid_transactions)} transactions for Plaid API")
        print(
            f"Sample formatted transaction: {plaid_transactions[0] if plaid_transactions else 'None'}"
        )

        # Call Plaid enrich API
        print("Calling Plaid enrich API...")
        enriched_response = await enrich_transactions_with_plaid(plaid_transactions)
        print("Plaid API call completed")

        # Merge enriched data with base transactions
        merged_transactions = merge_enriched_data(base_transactions, enriched_response)

        # Calculate totals
        total_expenses = sum(
            txn["amount"] for txn in merged_transactions if txn["type"] == "expense"
        )
        total_income = sum(
            txn["amount"] for txn in merged_transactions if txn["type"] == "income"
        )

        return {
            "transactions": merged_transactions,
            "totalExpenses": float(total_expenses),
            "totalIncome": float(total_income),
            "period": "",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error enriching transactions: {str(e)}"
        )
