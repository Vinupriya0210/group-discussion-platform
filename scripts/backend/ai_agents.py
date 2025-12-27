import requests
import json
from typing import List, Dict, Optional
import random

API_KEY = "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"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "qwen/qwen-2.5-7b-instruct"

class AdminAgent:
    """AI Admin that moderates the GD"""
    
    def __init__(self):
        self.name = "Admin"
        
    async def announce_topic(self) -> Dict[str, str]:
        """Generate GD topic and opening announcement"""
        
        prompt = """You are an HR Admin conducting a Group Discussion for campus placements.

Generate a relevant and challenging GD topic suitable for engineering students. 
The topic should be current, debatable, and test their analytical and communication skills.

Then write a professional opening announcement (2-3 sentences) that:
1. Introduces the topic
2. Sets expectations for corporate behavior
3. Starts the discussion

Return response in JSON format:
{
    "topic": "the GD topic",
    "message": "your opening announcement"
}"""
        
        response = self._call_api(prompt)
        
        try:
            result = json.loads(response)
            return result
        except:
            # Fallback
            return {
                "topic": "Should AI replace human jobs in the next decade?",
                "message": "Good morning everyone. Today's topic is: Should AI replace human jobs in the next decade? This is a corporate-style group discussion. Please maintain professionalism, listen to others, and present your viewpoints clearly. You may begin."
            }
    
    async def close_discussion(self) -> str:
        """Generate closing message"""
        return "Thank you everyone for your participation. The discussion is now concluded. Please wait while we prepare your evaluation reports."
    
    def _call_api(self, prompt: str, system: str = None) -> str:
        """Call OpenRouter API"""
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = requests.post(
                API_URL,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": messages,
                    "temperature": 0.8
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return "I understand the topic. Let me share my perspective."
        except Exception as e:
            return "I understand the topic. Let me share my perspective."


class CandidateAgent:
    """AI Candidate participating in GD"""
    
    def __init__(self, name: str):
        self.name = name
        self.personality = self._generate_personality()
        
    def _generate_personality(self) -> str:
        """Generate varied candidate personalities"""
        personalities = [
            "analytical and data-driven",
            "passionate and persuasive",
            "balanced and diplomatic",
            "creative and innovative",
            "practical and solution-oriented"
        ]
        return random.choice(personalities)
    
    async def generate_response(self, topic: str, discussion_context: List[Dict], human_input: str) -> str:
        """Generate contextual response to discussion"""
        
        # Build context from recent messages
        context_str = "\n".join([
            f"{msg['participant']}: {msg['message']}" 
            for msg in discussion_context[-3:] if msg['participant'] != self.name
        ])
        
        prompt = f"""You are a candidate in a corporate Group Discussion for campus placements.

Topic: {topic}

Recent discussion:
{context_str}

Latest input: {human_input}

Your personality: {self.personality}

Generate a response (2-4 sentences) that:
- Relates to the topic and ongoing discussion
- Shows you're listening to others
- Presents a clear viewpoint
- Uses professional language
- Occasionally builds on or politely disagrees with others

Keep it natural and conversational. DO NOT be overly formal."""
        
        response = self._call_api(prompt)
        return response
    
    def _call_api(self, prompt: str) -> str:
        """Call OpenRouter API"""
        try:
            response = requests.post(
                API_URL,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.9,
                    "max_tokens": 150
                },
                timeout=30
            )
            
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                # Clean up response
                return content.strip()
            else:
                return f"That's an interesting point. I believe we should consider multiple perspectives on {topic}."
        except Exception as e:
            return "I'd like to add that this topic requires careful consideration of all stakeholders involved."


class AnalysisAgent:
    """Silent evaluation agent"""
    
    async def evaluate_all_participants(
        self, 
        participants: List[Dict],
        participation_data: Dict,
        messages: List[Dict],
        topic: str
    ) -> Dict:
        """Generate comprehensive evaluation for all participants"""
        
        evaluations = []
        
        for participant in participants:
            name = participant["name"]
            data = participation_data.get(name, {})
            
            # Skip Admin
            if name == "Admin":
                continue
            
            # Calculate metrics
            speaking_count = data.get("speaking_count", 0)
            word_count = data.get("word_count", 0)
            entry_time = data.get("entry_time", 999)
            messages_list = data.get("messages", [])
            
            # Generate detailed evaluation using AI
            eval_result = await self._evaluate_participant(
                name=name,
                topic=topic,
                speaking_count=speaking_count,
                word_count=word_count,
                entry_time=entry_time,
                messages=messages_list
            )
            
            evaluations.append(eval_result)
        
        # Sort by overall score for ranking
        evaluations.sort(key=lambda x: x["overall_score"], reverse=True)
        
        # Add ranks
        for idx, eval_data in enumerate(evaluations):
            eval_data["rank"] = idx + 1
        
        return {
            "rankings": evaluations,
            "summary": self._generate_summary(evaluations)
        }
    
    async def _evaluate_participant(
        self,
        name: str,
        topic: str,
        speaking_count: int,
        word_count: int,
        entry_time: float,
        messages: List[str]
    ) -> Dict:
        """Evaluate individual participant"""
        
        # Concatenate messages for content analysis
        content = " ".join(messages) if messages else "No contribution"
        
        prompt = f"""You are an HR evaluator for campus placements conducting a strict GD evaluation.

Participant: {name}
Topic: {topic}
Speaking frequency: {speaking_count} times
Total words: {word_count}
Entry time: {entry_time:.1f} seconds
Content: {content}

Evaluate this participant on a scale of 1-10 for each:

1. Communication: Clarity, articulation, confidence
2. Content Relevance: How well they addressed the topic
3. Leadership: Initiative, guiding discussion
4. Confidence: Body language (inferred), conviction
5. Team Behavior: Listening, building on others' points
6. Corporate Readiness: Professional language, maturity

Also provide:
- 2-3 specific strengths
- 2-3 areas for improvement
- 1-2 sentences of HR remarks
- 2-3 actionable suggestions for improvement

Return ONLY valid JSON:
{{
    "communication": score,
    "content_relevance": score,
    "leadership": score,
    "confidence": score,
    "team_behavior": score,
    "corporate_readiness": score,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "hr_remarks": "remarks here",
    "suggestions": ["suggestion1", "suggestion2"]
}}"""
        
        response = self._call_api(prompt)
        
        try:
            result = json.loads(response)
            
            # Calculate overall score
            scores = [
                result["communication"],
                result["content_relevance"],
                result["leadership"],
                result["confidence"],
                result["team_behavior"],
                result["corporate_readiness"]
            ]
            overall = sum(scores) / len(scores)
            
            result["overall_score"] = round(overall, 2)
            result["name"] = name
            result["placement_readiness"] = self._readiness_level(overall)
            
            return result
        except:
            # Fallback evaluation
            return {
                "name": name,
                "communication": 6,
                "content_relevance": 6,
                "leadership": 5,
                "confidence": 6,
                "team_behavior": 7,
                "corporate_readiness": 6,
                "overall_score": 6.0,
                "strengths": ["Participated in discussion", "Professional demeanor"],
                "weaknesses": ["Could improve content depth", "Need more initiative"],
                "hr_remarks": "Satisfactory performance with room for growth.",
                "suggestions": ["Practice speaking with more examples", "Take more initiative"],
                "placement_readiness": "Moderate"
            }
    
    def _readiness_level(self, score: float) -> str:
        """Determine placement readiness"""
        if score >= 8.5:
            return "Excellent - Ready for top-tier placements"
        elif score >= 7.5:
            return "Good - Ready for mid-tier placements"
        elif score >= 6.5:
            return "Moderate - Needs practice"
        else:
            return "Needs Significant Improvement"
    
    def _generate_summary(self, evaluations: List[Dict]) -> str:
        """Generate overall summary"""
        return f"Evaluation complete for {len(evaluations)} participants. Rankings have been determined based on comprehensive performance analysis."
    
    def _call_api(self, prompt: str) -> str:
        """Call OpenRouter API"""
        try:
            response = requests.post(
                API_URL,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 800
                },
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return "{}"
        except Exception as e:
            return "{}"
