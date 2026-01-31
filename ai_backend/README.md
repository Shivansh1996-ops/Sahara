# Sahara AI Backend - ChatterBot Integration

A Python-based AI backend for Sahara mental wellness companion using ChatterBot library.

## Features

✅ **ChatterBot Integration** - Conversational AI trained on mental wellness data
✅ **Sentiment Analysis** - Detects emotional content in messages
✅ **Crisis Detection** - Identifies crisis indicators and provides resources
✅ **Emotion Recognition** - Detects specific emotions (anxiety, depression, stress, etc.)
✅ **Risk Assessment** - Evaluates risk level of messages
✅ **Conversation Logging** - Tracks conversations for analytics
✅ **REST API** - Easy integration with Next.js frontend
✅ **CORS Support** - Works seamlessly with frontend

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. **Navigate to the backend directory:**
```bash
cd sahara/ai_backend
```

2. **Create a virtual environment (recommended):**
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

## Running the Backend

### Option 1: Using startup scripts

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
bash start.sh
```

### Option 2: Manual startup

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns server status.

**Response:**
```json
{
  "status": "healthy",
  "service": "Sahara AI Backend",
  "timestamp": "2024-01-05T10:30:00"
}
```

### 2. Chat
```
POST /chat
```
Get AI response to user message.

**Request:**
```json
{
  "message": "I'm feeling anxious",
  "userId": "user123"
}
```

**Response:**
```json
{
  "response": "Anxiety can feel overwhelming. Let's take a moment together...",
  "confidence": 0.85,
  "sentiment": "negative",
  "timestamp": "2024-01-05T10:30:00"
}
```

### 3. Analyze
```
POST /analyze
```
Analyze message for emotional content.

**Request:**
```json
{
  "message": "I'm feeling sad and lonely"
}
```

**Response:**
```json
{
  "sentiment": "negative",
  "emotions": {
    "sadness": true,
    "anxiety": false,
    "anger": false,
    "happiness": false,
    "fear": false,
    "loneliness": true
  },
  "riskLevel": "moderate",
  "timestamp": "2024-01-05T10:30:00"
}
```

### 4. Train
```
POST /train
```
Train the bot with new conversation data.

**Request:**
```json
{
  "statement": "I'm having trouble sleeping",
  "response": "Sleep troubles can be really frustrating. Have you tried any relaxation techniques?"
}
```

**Response:**
```json
{
  "status": "trained",
  "statement": "I'm having trouble sleeping",
  "response": "Sleep troubles can be really frustrating...",
  "timestamp": "2024-01-05T10:30:00"
}
```

### 5. Crisis Check
```
POST /crisis-check
```
Check if message indicates crisis.

**Request:**
```json
{
  "message": "I want to hurt myself"
}
```

**Response:**
```json
{
  "isCrisis": true,
  "resources": [
    {
      "name": "National Suicide Prevention Lifeline",
      "phone": "988",
      "url": "https://988lifeline.org",
      "country": "USA"
    }
  ],
  "timestamp": "2024-01-05T10:30:00"
}
```

## Configuration

### Environment Variables

Create a `.env` file in the `ai_backend` directory:

```env
PORT=5000
DEBUG=False
FLASK_ENV=production
```

### Database

The bot uses SQLite database (`sahara_bot.db`) to store trained conversations. The database is created automatically on first run.

## Training Data

The bot is pre-trained with mental wellness conversation data covering:

- **Greetings** - Initial engagement
- **Anxiety Support** - Panic, worry, nervousness
- **Depression Support** - Sadness, hopelessness, emptiness
- **Stress Management** - Overwhelm, burnout
- **Loneliness** - Isolation, disconnection
- **Positive Affirmations** - Encouragement, celebration
- **Coping Strategies** - Practical techniques
- **Self-Care** - Health and wellness
- **Crisis Support** - Emergency resources

## Sentiment Analysis

The backend analyzes sentiment using keyword matching:

- **Positive**: happy, good, great, grateful, improving
- **Negative**: sad, anxious, stressed, overwhelmed, hopeless
- **Neutral**: other messages

## Emotion Detection

Detects specific emotions:
- Sadness
- Anxiety
- Anger
- Happiness
- Fear
- Loneliness

## Risk Assessment

Evaluates risk level:
- **Critical**: Mentions suicide, self-harm
- **High**: Hopelessness, worthlessness
- **Moderate**: Depression, anxiety symptoms
- **Low**: General conversation

## Conversation Logging

All conversations are logged to `conversation_logs.jsonl` for analytics and improvement.

## Integration with Next.js

The Next.js frontend calls the backend via the `/api/chat` endpoint:

```typescript
// In sahara/src/app/api/chat/route.ts
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:5000";

const response = await fetch(`${AI_BACKEND_URL}/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message, userId })
});
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change it in `.env`:
```env
PORT=5001
```

### Module Not Found
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Database Locked
Delete `sahara_bot.db` and restart:
```bash
rm sahara_bot.db
python app.py
```

### CORS Issues
CORS is enabled by default. If issues persist, check Flask-CORS configuration in `app.py`.

## Performance Tips

1. **Use virtual environment** - Isolates dependencies
2. **Enable caching** - Reduces database queries
3. **Monitor logs** - Check `conversation_logs.jsonl` for patterns
4. **Regular training** - Add new conversation data periodically

## Security

- Never commit `.env` file with sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Log conversations securely
- Implement rate limiting in production

## Future Enhancements

- [ ] Machine learning model training
- [ ] Multi-language support
- [ ] Advanced NLP processing
- [ ] User preference learning
- [ ] Integration with professional resources
- [ ] Real-time analytics dashboard

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review conversation logs
3. Check Flask/ChatterBot documentation
4. Open an issue on GitHub

## License

Part of Sahara Mental Wellness Platform

---

**Status**: ✅ Production Ready
**Last Updated**: January 2024
**Version**: 1.0.0
