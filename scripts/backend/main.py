from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
import json
from datetime import datetime
import uuid
from ai_agents import AdminAgent, CandidateAgent, AnalysisAgent
from gd_engine import GDEngine

app = FastAPI(title="AI GD Simulation Platform")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active GD sessions
active_sessions: Dict[str, GDEngine] = {}

# Pydantic models
class CreateSessionRequest(BaseModel):
    session_id: Optional[str] = None

class MessageRequest(BaseModel):
    session_id: str
    participant: str
    message: str
    timestamp: str

class SessionResponse(BaseModel):
    session_id: str
    status: str
    topic: Optional[str] = None
    start_time: Optional[str] = None
    participants: List[Dict]

@app.get("/")
async def root():
    return {"message": "AI GD Simulation Platform API", "version": "1.0"}

@app.post("/api/session/create", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest):
    """Create a new GD session"""
    session_id = request.session_id or str(uuid.uuid4())
    
    if session_id in active_sessions:
        raise HTTPException(status_code=400, detail="Session already exists")
    
    # Initialize GD Engine with AI agents
    engine = GDEngine(session_id)
    active_sessions[session_id] = engine
    
    # Add human participant "YOU"
    engine.add_participant("YOU", is_human=True)
    
    # Add initial AI candidates (minimum 4 more to make 5 total)
    for i in range(4):
        engine.add_ai_candidate()
    
    return SessionResponse(
        session_id=session_id,
        status="initialized",
        topic=None,
        start_time=None,
        participants=engine.get_participants()
    )

@app.post("/api/session/start")
async def start_session(session_id: str):
    """Start the GD session - Admin announces topic and begins"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    engine = active_sessions[session_id]
    result = await engine.start_discussion()
    
    return result

@app.post("/api/message/send")
async def send_message(request: MessageRequest):
    """Handle human participant message and trigger AI responses"""
    if request.session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    engine = active_sessions[request.session_id]
    
    # Process human message
    engine.add_message(request.participant, request.message, request.timestamp)
    
    # Track for evaluation
    engine.track_participation(request.participant, request.message)
    
    # Trigger AI candidate responses
    ai_responses = await engine.generate_ai_responses(request.message)
    
    return {
        "status": "success",
        "ai_responses": ai_responses,
        "elapsed_time": engine.get_elapsed_time()
    }

@app.get("/api/session/{session_id}/status")
async def get_session_status(session_id: str):
    """Get current session status"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    engine = active_sessions[session_id]
    
    return {
        "session_id": session_id,
        "status": engine.status,
        "topic": engine.topic,
        "elapsed_time": engine.get_elapsed_time(),
        "participants": engine.get_participants(),
        "messages": engine.messages
    }

@app.post("/api/session/end")
async def end_session(session_id: str):
    """End the GD session and generate evaluation report"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    engine = active_sessions[session_id]
    
    # Generate comprehensive evaluation
    evaluation = await engine.end_discussion()
    
    return evaluation

@app.get("/api/session/{session_id}/inject-candidates")
async def inject_candidates(session_id: str):
    """Inject additional AI candidates at 5-minute mark"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    engine = active_sessions[session_id]
    
    # Check if 5 minutes elapsed
    if engine.get_elapsed_time() >= 300:  # 5 minutes
        human_count = engine.get_human_count()
        
        if human_count == 1:
            # Add 2 candidates
            engine.add_ai_candidate()
            engine.add_ai_candidate()
        elif human_count == 2:
            # Add 1 candidate
            engine.add_ai_candidate()
        # If 3+, add 0
        
    return {"status": "success", "participants": engine.get_participants()}

@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    """Clean up session"""
    if session_id in active_sessions:
        del active_sessions[session_id]
    return {"status": "deleted"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
