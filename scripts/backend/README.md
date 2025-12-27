# AI GD Simulation Backend

## Setup

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Run the server:
\`\`\`bash
python main.py
\`\`\`

Server runs on `http://localhost:8000`

## API Endpoints

- `POST /api/session/create` - Create new GD session
- `POST /api/session/start` - Start GD discussion
- `POST /api/message/send` - Send participant message
- `GET /api/session/{id}/status` - Get session status
- `POST /api/session/end` - End session and get evaluation
- `GET /api/session/{id}/inject-candidates` - Inject candidates at 5min

## Environment

- Model: Qwen 2.5 7B via OpenRouter
- API Key: Embedded in ai_agents.py
