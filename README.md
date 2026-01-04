# Benefits Onboard

A full-stack application with a Next.js client and FastAPI server.

## Project Structure

```
benefits-onboard/
├── client/          # Next.js TypeScript app with Tailwind CSS
└── server/          # FastAPI Python server
```

## Client Setup

See `client/README.md` for details.

```bash
cd client
npm install
npm run dev
```

## Server Setup

See `server/README.md` for details.

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Development

- Client runs on: `http://localhost:3000`
- Server runs on: `http://localhost:8000`

## Testing

### Backend Tests

```bash
cd server
pytest
```

### Frontend E2E Tests

```bash
cd client
npm run test:e2e
```

**Note:** For full E2E tests, ensure both the client and server are running.

