from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import os
import random
import uuid
from typing import List, Optional
from datetime import datetime

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "typing_racer")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Pydantic models
class TypingResult(BaseModel):
    user_id: Optional[str] = None
    wpm: float
    accuracy: float
    time_taken: float
    characters_typed: int
    mistakes: int
    text_length: int
    timestamp: datetime

class PracticeText(BaseModel):
    text: str
    difficulty: str = "medium"

# Sample texts for practice
PRACTICE_TEXTS = {
    "easy": [
        "The quick brown fox jumps over the lazy dog.",
        "A journey of a thousand miles begins with a single step.",
        "To be or not to be that is the question.",
        "All that glitters is not gold.",
        "Better late than never but never late is better."
    ],
    "medium": [
        "In the midst of winter, I found there was, within me, an invincible summer.",
        "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",
        "Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
        "Life is what happens to you while you're busy making other plans.",
        "The future belongs to those who believe in the beauty of their dreams."
    ],
    "hard": [
        "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better.",
        "The way to get started is to quit talking and begin doing. All our dreams can come true, if we have the courage to pursue them.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. The pessimist sees difficulty in every opportunity.",
        "Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present.",
        "Be yourself; everyone else is already taken. In three words I can sum up everything I've learned about life: it goes on."
    ]
}

@app.get("/")
async def root():
    return {"message": "AI-Powered Typing Racer API"}

@app.get("/api/practice-text")
async def get_practice_text(difficulty: str = "medium"):
    """Get a random practice text for typing"""
    if difficulty not in PRACTICE_TEXTS:
        difficulty = "medium"
    
    text = random.choice(PRACTICE_TEXTS[difficulty])
    return PracticeText(text=text, difficulty=difficulty)

@app.post("/api/results")
async def save_result(result: TypingResult):
    """Save typing practice result"""
    try:
        # Generate unique ID for the result
        result_id = str(uuid.uuid4())
        
        # Convert to dict and add ID
        result_dict = result.dict()
        result_dict["result_id"] = result_id
        result_dict["timestamp"] = datetime.utcnow()
        
        # Insert into database
        await db.typing_results.insert_one(result_dict)
        
        return {"message": "Result saved successfully", "result_id": result_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving result: {str(e)}")

@app.get("/api/stats")
async def get_user_stats(user_id: Optional[str] = None):
    """Get typing statistics for a user or global stats"""
    try:
        query = {}
        if user_id:
            query["user_id"] = user_id
        
        results = await db.typing_results.find(query, {"_id": 0}).to_list(length=100)
        
        if not results:
            return {"total_sessions": 0, "average_wpm": 0, "average_accuracy": 0}
        
        # Calculate averages
        total_sessions = len(results)
        avg_wpm = sum(r["wpm"] for r in results) / total_sessions
        avg_accuracy = sum(r["accuracy"] for r in results) / total_sessions
        
        return {
            "total_sessions": total_sessions,
            "average_wpm": round(avg_wpm, 2),
            "average_accuracy": round(avg_accuracy, 2),
            "recent_results": results[-10:]  # Last 10 results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=os.environ.get('HOST','0.0.0.0'), port=int(os.environ.get('PORT','5000')))