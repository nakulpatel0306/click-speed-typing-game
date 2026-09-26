# Click - A Typing Speed Game

A typing practice app with a FastAPI backend and a React frontend. Type a generated passage and track WPM, accuracy, mistakes and time as you go.

## At a Glance

- **Frontend:** React, Tailwind CSS, shadcn/ui, craco
- **Backend:** FastAPI, Uvicorn, optional MongoDB (Motor)
- **State:** Complete

## Features

- Practice text at easy, medium or hard difficulty
- Live WPM and accuracy while typing
- Per-character feedback for correct, incorrect and current letters
- Saves each session and shows aggregate stats
- Falls back to in-memory storage when no database is set

## Project Structure

```
.
├── backend/
│   ├── server.py            # API for practice text, results and stats
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main UI and typing logic
│   │   └── components/ui/   # shadcn/ui components
│   ├── tailwind.config.js
│   └── craco.config.js
└── backend_test.py          # Hits each endpoint and logs pass or fail
```

## Running Locally

1. Start the backend (runs on port 5000):
   ```bash
   cd backend
   python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python server.py
   ```
2. Create `frontend/.env` so the frontend can find the API:
   ```
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```
3. In a second terminal, start the frontend (Node 18 or 20) and open `http://localhost:3000`:
   ```bash
   cd frontend
   yarn install
   yarn start
   ```

Optional backend env vars are `DB_URL` (MongoDB connection string) and `DB_NAME` (defaults to `typing_racer`).

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/practice-text?difficulty=easy\|medium\|hard` | Returns a passage for the chosen difficulty |
| `POST` | `/api/results` | Saves one session (`wpm`, `accuracy`, `time_taken`, `mistakes`, and more) |
| `GET` | `/api/stats` | Total sessions, average WPM and accuracy, last 10 results |

Run `python backend_test.py` with the backend up to check every endpoint.
