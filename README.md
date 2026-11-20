# Click - A Typing Speed Game

A typing practice app with a FastAPI backend and a React frontend. Pick a difficulty, type the passage it serves, and watch WPM, accuracy, mistakes and time update as you go.

## At a Glance

- **Frontend:** React, Tailwind CSS, shadcn/ui, craco
- **Backend:** FastAPI, Uvicorn, MongoDB (Motor)
- **State:** Complete

## Features

- Practice passages at easy, medium or hard difficulty, with a button for a new one
- Timer starts on the first keystroke; WPM, accuracy and mistakes update live
- Per-character feedback for correct, incorrect and current letters, plus a progress bar
- Results card when you finish, with Try Again and New Text
- API stores finished sessions in MongoDB and returns aggregate stats
- Falls back to a built-in passage if the backend is unreachable

## Project Structure

```
.
├── backend/
│   ├── server.py            # API for practice text, results and stats
│   └── requirements.txt
├── tests/                   # Empty package placeholder
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main UI and typing logic
│   │   └── components/ui/   # shadcn/ui components
│   ├── tailwind.config.js
│   └── craco.config.js
└── backend_test.py          # Hits each endpoint and logs pass or fail
```

## Running Locally

1. Start MongoDB locally (the backend expects `mongodb://localhost:27017`), then start the backend on port 5000:
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

Optional backend env vars are `MONGO_URL` (defaults to `mongodb://localhost:27017`), `DB_NAME` (defaults to `typing_racer`), `HOST` and `PORT`. Practice text works without MongoDB; saving results and stats need it.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/practice-text?difficulty=easy\|medium\|hard` | Returns a passage for the chosen difficulty |
| `POST` | `/api/results` | Saves one session (`wpm`, `accuracy`, `time_taken`, `characters_typed`, `mistakes`, `text_length`, `timestamp`, optional `user_id`) |
| `GET` | `/api/stats?user_id=` | Total sessions, average WPM and accuracy, recent results (optionally for one `user_id`) |

With the backend and MongoDB up, run `python backend_test.py` from the repo root (needs `requests`) to check every endpoint.
