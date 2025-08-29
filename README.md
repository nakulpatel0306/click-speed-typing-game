# Click - A Typing Speed Game

An AI‑assisted typing practice app with a **FastAPI** backend and a **React + Tailwind** frontend. 
Type a generated passage, track **WPM, accuracy, mistakes, and time**, and save results for basic stats.

---

## ✨ Features
- Difficulty‑based practice text (easy / medium / hard)
- Live **WPM** and **accuracy** as you type
- Visual progress and per‑character feedback (correct / incorrect / current)
- Save results and view simple aggregate stats
- Modern, responsive UI (Tailwind + shadcn/ui components)

---

## 🗂 Project Structure
```
.
├── backend/                        # FastAPI service
│   ├── server.py                   # API (practice text, results, stats)
│   ├── requirements.txt
│   └── .env                        # (optional) DB_URL, DB_NAME, etc.
├── frontend/                       # React app (CRA + craco + Tailwind)
│   ├── public/
│   │   └── index.html              # <title> Click - A Typing Speed Game
│   ├── src/
│   │   ├── App.js                  # Main UI and typing logic
│   │   ├── App.css                 # App styles
│   │   ├── index.css               # Tailwind base + tokens
│   │   └── components/ui/*         # shadcn/ui components
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── craco.config.js
│   └── .env                        # REACT_APP_BACKEND_URL=http://localhost:5000
├── test_result.md                  # Testing protocol log (optional)
└── backend_test.py                 # Simple API tester (optional)
```

---

## 🚀 Getting Started

### 1) Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt

# start the API (default PORT=5000 to match the frontend)
export PORT=5000                 # Windows PowerShell: setx PORT 5000 (then restart shell)
uvicorn server:app --host 0.0.0.0 --port $PORT
# or: python server.py
```
**Environment variables (optional):**
- `DB_URL` — MongoDB connection string (falls back to local memory if not set)
- `DB_NAME` — MongoDB database name (default: `typing_racer`)

### 2) Frontend (React + Tailwind)
```bash
cd frontend

# Use Node 18 or 20 (recommended). If you have Homebrew:
#   brew install node@20 && brew link --overwrite --force node@20
# Or use Volta:
#   curl https://get.volta.sh | bash && volta install node@20 yarn@1.22.22

yarn install
yarn start
```
The app runs at **http://localhost:3000** and points to the backend in `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

---

## 🔌 API Endpoints (summary)
> Base URL: `http://localhost:5000` (configurable via env)

- **GET `/api/practice-text?difficulty=easy|medium|hard`**  
  Returns a practice text string and the resolved difficulty.

- **POST `/api/results`**  
  Body (JSON):
  ```json
  {
    "user_id": "optional-id",
    "wpm": 85,
    "accuracy": 96,
    "time_taken": 42.1,
    "characters_typed": 240,
    "mistakes": 5,
    "text_length": 240
  }
  ```
  Stores a single typing session result.

- **GET `/api/stats`**  
  Returns basic aggregated stats (total sessions, average WPM/accuracy, recent 10 results).

*(Endpoint names are inferred from the frontend usage and backend structure.)*

---

## 🧪 Local Testing (optional)
A simple tester is included:
```bash
python backend_test.py
```
It will call the backend endpoints and log pass/fail results.

---

## 🛠 Tech Stack
- **Frontend:** React 19, Tailwind CSS, shadcn/ui, lucide-react, craco
- **Backend:** FastAPI, Uvicorn, (optional) MongoDB via Motor
- **Tooling:** Yarn, PostCSS, ESLint

---

## 📦 Production Build
Frontend:
```bash
cd frontend
yarn build
# Deploy the 'build/' folder to Netlify, Vercel, or any static host
```
Backend:
```bash
cd backend
# example: uvicorn server:app --host 0.0.0.0 --port 8080
# Use a process manager (e.g., systemd, pm2) or a PaaS (Render, Fly.io, Railway)
```
