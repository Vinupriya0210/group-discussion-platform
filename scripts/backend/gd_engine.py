import asyncio
from datetime import datetime
from typing import List, Dict, Optional
import random
from ai_agents import AdminAgent, CandidateAgent, AnalysisAgent

class GDEngine:
    """Core GD simulation engine"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.status = "initialized"
        self.topic = None
        self.start_time = None
        self.participants = []
        self.messages = []
        self.participant_count = 0
        
        # Initialize AI agents
        self.admin_agent = AdminAgent()
        self.analysis_agent = AnalysisAgent()
        self.candidate_agents = []
        
        # Tracking data
        self.participation_data = {}
        
    def add_participant(self, name: str, is_human: bool = False):
        """Add a participant to the GD"""
        participant = {
            "id": f"p{self.participant_count}",
            "name": name,
            "is_human": is_human,
            "join_time": datetime.now().isoformat()
        }
        self.participants.append(participant)
        self.participation_data[name] = {
            "messages": [],
            "entry_time": None,
            "speaking_count": 0,
            "word_count": 0
        }
        self.participant_count += 1
        
    def add_ai_candidate(self):
        """Add an AI candidate"""
        candidate_num = len([p for p in self.participants if not p["is_human"]]) + 1
        candidate_name = f"Candidate {candidate_num}"
        
        # Create AI agent for this candidate
        agent = CandidateAgent(candidate_name)
        self.candidate_agents.append(agent)
        
        self.add_participant(candidate_name, is_human=False)
        
    def get_participants(self) -> List[Dict]:
        """Return participant list"""
        return self.participants
    
    def get_human_count(self) -> int:
        """Count human participants"""
        return len([p for p in self.participants if p["is_human"]])
    
    async def start_discussion(self) -> Dict:
        """Start the GD - Admin announces topic"""
        self.status = "in_progress"
        self.start_time = datetime.now()
        
        # Admin generates topic and opening message
        topic_announcement = await self.admin_agent.announce_topic()
        self.topic = topic_announcement["topic"]
        
        # Add admin message
        self.add_message("Admin", topic_announcement["message"], datetime.now().isoformat())
        
        return {
            "status": "started",
            "topic": self.topic,
            "admin_message": topic_announcement["message"],
            "start_time": self.start_time.isoformat()
        }
    
    def add_message(self, participant: str, message: str, timestamp: str):
        """Add a message to transcript"""
        msg = {
            "participant": participant,
            "message": message,
            "timestamp": timestamp
        }
        self.messages.append(msg)
        
    def track_participation(self, participant: str, message: str):
        """Track participation metrics for evaluation"""
        if participant in self.participation_data:
            data = self.participation_data[participant]
            data["messages"].append(message)
            data["speaking_count"] += 1
            data["word_count"] += len(message.split())
            
            # Record first entry time
            if data["entry_time"] is None:
                data["entry_time"] = self.get_elapsed_time()
    
    async def generate_ai_responses(self, human_message: str) -> List[Dict]:
        """Generate responses from AI candidates"""
        responses = []
        
        # Randomly select 1-2 candidates to respond
        num_responses = random.randint(1, min(2, len(self.candidate_agents)))
        responding_agents = random.sample(self.candidate_agents, num_responses)
        
        for agent in responding_agents:
            # Generate contextual response
            response = await agent.generate_response(
                topic=self.topic,
                discussion_context=self.messages[-5:],  # Last 5 messages
                human_input=human_message
            )
            
            timestamp = datetime.now().isoformat()
            self.add_message(agent.name, response, timestamp)
            self.track_participation(agent.name, response)
            
            responses.append({
                "participant": agent.name,
                "message": response,
                "timestamp": timestamp
            })
            
            # Slight delay for realism
            await asyncio.sleep(random.uniform(1, 3))
        
        return responses
    
    def get_elapsed_time(self) -> float:
        """Get elapsed time in seconds"""
        if self.start_time:
            return (datetime.now() - self.start_time).total_seconds()
        return 0
    
    async def end_discussion(self) -> Dict:
        """End discussion and generate evaluation"""
        self.status = "completed"
        
        # Generate admin closing message
        closing = await self.admin_agent.close_discussion()
        self.add_message("Admin", closing, datetime.now().isoformat())
        
        # Generate comprehensive evaluation using Analysis Agent
        evaluation = await self.analysis_agent.evaluate_all_participants(
            participants=self.participants,
            participation_data=self.participation_data,
            messages=self.messages,
            topic=self.topic
        )
        
        return {
            "status": "completed",
            "admin_closing": closing,
            "evaluation": evaluation
        }
