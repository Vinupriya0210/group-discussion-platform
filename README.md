# AI Group Discussion Simulation Platform

A comprehensive college-wide, placement-focused AI Group Discussion (GD) simulation platform built with Next.js (React) frontend and FastAPI (Python) backend.

## Features

- **No Landing Page**: Users enter directly into the GD Room
- **Human Participant**: Always labeled as "YOU"
- **AI Candidates**: Other participants shown as "Candidate 1", "Candidate 2", etc.
- **Real-time Discussion**: Google Meet-style interface with live transcript
- **Dual Input Modes**: Text input and voice input (Speech-to-Text)
- **AI Moderation**: Admin agent announces topic and moderates discussion
- **Dynamic Candidates**: Auto-inject candidates at 5-minute mark based on human count
- **Comprehensive Evaluation**: Detailed performance analysis with rankings, skill scores, and suggestions
- **Custom Color Scheme**: Professional green theme optimized for educational context

## Architecture

### Frontend (Next.js/React)
- `/app/page.tsx` - Main entry point, initializes GD session
- `/components/gd-room.tsx` - Main GD interface
- `/components/participant-tiles.tsx` - Participant list display
- `/components/discussion-transcript.tsx` - Real-time message display
- `/components/timer.tsx` - Session timer
- `/components/evaluation-results.tsx` - Performance report page

### Backend (FastAPI/Python)
- `scripts/backend/main.py` - FastAPI server with REST endpoints
- `scripts/backend/gd_engine.py` - Core GD simulation engine
- `scripts/backend/ai_agents.py` - AI agents (Admin, Candidate, Analysis)

### AI Integration
- **Model**: Qwen 2.5 7B via OpenRouter
- **API Key**: Pre-configured (embedded)
- **Agents**:
  - **Admin Agent**: Topic generation and moderation
  - **Candidate Agents**: Multiple AI participants with varied personalities
  - **Analysis Agent**: Silent evaluation and comprehensive reporting

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.9+
- pip

### Frontend Setup

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

Frontend runs on `http://localhost:3000`

### Backend Setup

1. Navigate to backend directory:
```bash
cd scripts/backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
python main.py
```

Backend API runs on `http://localhost:8000`

### Running Both Services

You need to run both frontend and backend simultaneously:

**Terminal 1** (Frontend):
```bash
npm run dev
```

**Terminal 2** (Backend):
```bash
cd scripts/backend
python main.py
```

Then open `http://localhost:3000` in your browser.

## Usage Flow

1. **Auto-Initialize**: Page loads and creates a new GD session
2. **Auto-Start**: GD begins automatically with Admin announcing the topic
3. **Participate**: Use text input or voice input to contribute
4. **AI Responses**: AI candidates respond contextually to the discussion
5. **Time Management**: 10-minute default duration, candidates injected at 5 minutes
6. **End Session**: Click "End GD" button
7. **View Results**: Comprehensive evaluation with rankings, scores, and suggestions
8. **Download Report**: Export evaluation as JSON

## API Endpoints

- `POST /api/session/create` - Create new GD session
- `POST /api/session/start` - Start discussion with topic
- `POST /api/message/send` - Send participant message, get AI responses
- `GET /api/session/{id}/status` - Get current session state
- `GET /api/session/{id}/inject-candidates` - Add candidates at 5min mark
- `POST /api/session/end` - End session and generate evaluation
- `DELETE /api/session/{id}` - Clean up session

## Evaluation Metrics

Each participant is scored (1-10) on:
- **Communication**: Clarity, articulation, confidence
- **Content Relevance**: Topic understanding and contribution
- **Leadership**: Initiative and discussion guidance
- **Confidence**: Conviction and assertiveness
- **Team Behavior**: Listening and collaboration
- **Corporate Readiness**: Professional language and maturity

## Customization

### Change Discussion Duration
Edit `components/gd-room.tsx`:
```tsx
// Auto-inject at X minutes (default: 5 minutes = 300 seconds)
if (elapsedSeconds >= 300 && !injectedAt5Min && started) {
```

### Change Candidate Injection Rules
Edit `scripts/backend/main.py` in `/api/session/{session_id}/inject-candidates`:
```python
if human_count == 1:
    engine.add_ai_candidate()
    engine.add_ai_candidate()
# Modify as needed
```

### Change AI Model
Edit `scripts/backend/ai_agents.py`:
```python
MODEL = "qwen/qwen-2.5-7b-instruct"  # Change to any OpenRouter model
```

### Custom Color Scheme
Edit `app/globals.css`:
```css
:root {
  --bg-main: #f2f6f0;
  --green-primary: #0f2c1f;
  /* Modify colors as needed */
}
```

## Browser Compatibility

- **Voice Input**: Requires Chrome, Edge, or Safari (uses Web Speech API)
- **Text Input**: Works in all modern browsers

## Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Any Python hosting)
- Railway
- Render
- Heroku
- AWS/GCP/Azure

**Important**: Update the API URL in frontend components after deploying backend.

In `components/gd-room.tsx` and `app/page.tsx`, replace:
```tsx
fetch("http://localhost:8000/api/...") 
```
with your deployed backend URL:
```tsx
fetch("https://your-backend-url.com/api/...")
```

## Troubleshooting

**Issue**: "Failed to create session"
- Ensure backend is running on port 8000
- Check CORS settings in `main.py`

**Issue**: Voice input not working
- Use Chrome/Edge/Safari browser
- Allow microphone permissions
- Check browser console for errors

**Issue**: AI responses slow or failing
- Check internet connection (API calls to OpenRouter)
- Verify API key is valid
- Check backend logs for errors

## License

Built for educational and campus placement training purposes.
