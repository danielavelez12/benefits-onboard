# Server

FastAPI server for Benefits Onboard.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up Gemini API Key:

   - Get your API key from: https://makersuite.google.com/app/apikey
   - Create a `.env` file in the `server` directory:

   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

   Or set it as an environment variable:

   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```

   On Windows:

   ```bash
   set GEMINI_API_KEY=your_api_key_here
   ```

   **Note:** The application uses `gemini-2.5-flash` which is the best free model available with vision support for both text and image processing.

   To check all available models with your API key, run:

   ```bash
   python app/list_models.py
   ```

## Running the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

Run tests with pytest:

```bash
pytest
```

Run tests with verbose output:

```bash
pytest -v
```

Run specific test file:

```bash
pytest tests/test_main.py
pytest tests/test_helpers.py
```

## API Endpoints

### POST `/api/upload-bank-statement`

Upload and process a bank statement document (PDF or image).

**Request:**

- Content-Type: `multipart/form-data`
- Body: File upload (PDF, PNG, JPG, JPEG)

**Response:**

```json
{
  "transactions": [
    {
      "date": "2024-01-15",
      "description": "Grocery Store",
      "amount": 125.5,
      "type": "expense"
    }
  ],
  "totalExpenses": 1250.0,
  "totalIncome": 5000.0,
  "period": "January 2024"
}
```
