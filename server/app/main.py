from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.helpers import process_bank_statement

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
    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg"}
    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Process bank statement using Gemini
        result = process_bank_statement(file_content, file.filename)
        
        # Check for processing errors
        if "error" in result:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to process bank statement")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing bank statement: {str(e)}"
        )

