"""
Sahara AI Backend - Mental Wellness Support
Provides mental wellness support through conversational AI
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from difflib import SequenceMatcher

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Training data for mental wellness support
WELLNESS_TRAINING_DATA = [
    # Greetings
    ("Hello", "Hi there! How are you feeling today?"),
    ("Hi", "Hello! I'm here to listen. What's on your mind?"),
    ("Hey", "Hey! How can I support you today?"),
    ("Good morning", "Good morning! I hope you're taking care of yourself."),
    ("Good evening", "Good evening! How has your day been?"),
    
    # Emotional support - Anxiety
    ("I'm anxious", "Anxiety can feel overwhelming. Let's take a moment together. Can you tell me what's worrying you?"),
    ("I'm worried", "Worry is a natural response. What specifically is on your mind?"),
    ("I'm nervous", "It's okay to feel nervous. Remember, you've overcome challenges before."),
    ("I can't sleep", "Sleep troubles can be really frustrating. Have you tried any relaxation techniques?"),
    ("I'm panicking", "Take a deep breath with me. You're safe right now. Let's focus on the present moment."),
    
    # Emotional support - Depression
    ("I'm sad", "I hear you. Sadness is valid. Would you like to talk about what's making you feel this way?"),
    ("I'm depressed", "Depression is heavy. Thank you for sharing that with me. You're not alone in this."),
    ("I feel empty", "That emptiness can feel so isolating. I'm here to listen. What would help right now?"),
    ("I don't want to get out of bed", "When motivation is low, even small steps matter. What's one tiny thing you could do today?"),
    ("I feel hopeless", "Hopelessness is painful, but it can change. Please consider reaching out to someone you trust."),
    
    # Emotional support - Stress
    ("I'm stressed", "Stress can feel like too much. What's weighing on you the most right now?"),
    ("I'm overwhelmed", "When everything feels like too much, let's break it down. What's the most urgent thing?"),
    ("I have too much to do", "Feeling overloaded is real. Remember, you don't have to do everything today."),
    ("I'm burnt out", "Burnout is serious. Your well-being comes first. What do you need right now?"),
    
    # Emotional support - Loneliness
    ("I'm lonely", "Loneliness can feel so heavy. I'm here with you. Would you like to talk?"),
    ("I feel alone", "You're not alone in feeling this way. Many people experience loneliness."),
    ("Nobody understands me", "Feeling misunderstood is painful. I'm listening without judgment."),
    
    # Positive affirmations
    ("I'm doing well", "That's wonderful! I'm so glad to hear that. Keep taking care of yourself."),
    ("I'm happy", "Your happiness matters! What's bringing you joy today?"),
    ("I'm grateful", "Gratitude is beautiful. What are you grateful for?"),
    ("I'm proud of myself", "You should be! Recognizing your own strength is important."),
    
    # Coping strategies
    ("How do I manage anxiety?", "Try deep breathing, grounding techniques, or talking to someone you trust. What works best for you?"),
    ("How do I sleep better?", "Consistent sleep schedule, limiting screens before bed, and relaxation techniques can help."),
    ("How do I deal with stress?", "Exercise, journaling, meditation, or talking to someone can all help. What appeals to you?"),
    ("What should I do when I'm sad?", "Allow yourself to feel it, reach out to someone, do something comforting, or try gentle movement."),
    
    # Self-care
    ("I need self-care", "Self-care is important. What would make you feel better? Rest, movement, creativity, or connection?"),
    ("I haven't eaten today", "Taking care of your body matters. Would you like to grab something to eat?"),
    ("I haven't moved all day", "Movement can help your mood. Even a short walk can make a difference."),
    
    # Support seeking
    ("Should I see a therapist?", "Therapy can be really helpful. If you're struggling, it's a great step to consider."),
    ("I need help", "I'm glad you're reaching out. What kind of help do you need right now?"),
    ("Can you help me?", "I'm here to listen and support you. Tell me what's going on."),
    
    # Crisis indicators (handled specially)
    ("I want to hurt myself", "I'm really concerned about you. Please reach out to a crisis helpline or trusted person immediately."),
    ("I want to die", "Your life matters. Please contact a crisis helpline: 988 (USA) or text HOME to 741741."),
    ("I'm suicidal", "I care about you. Please reach out for help: National Suicide Prevention Lifeline: 988 (USA)."),
    
    # General conversation
    ("What's your name?", "I'm Sahara, your mental wellness companion. I'm here to listen and support you."),
    ("How are you?", "I'm here and ready to listen. How are you feeling?"),
    ("Tell me about yourself", "I'm Sahara, an AI companion designed to support your mental wellness through conversation."),
    ("What can you do?", "I can listen, offer support, help you process emotions, and provide coping strategies."),
]

# Simple in-memory knowledge base
knowledge_base = {statement: response for statement, response in WELLNESS_TRAINING_DATA}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def find_best_match(user_message):
    """Find best matching response using similarity matching"""
    user_message_lower = user_message.lower().strip()
    best_match = None
    best_score = 0.0
    
    for statement in knowledge_base.keys():
        # Calculate similarity
        score = SequenceMatcher(None, user_message_lower, statement.lower()).ratio()
        if score > best_score:
            best_score = score
            best_match = statement
    
    # Return response if match is good enough (>0.3 similarity)
    if best_match and best_score > 0.3:
        return knowledge_base[best_match], best_score
    
    # Default response
    return "I'm here to listen and support you. Could you tell me more about what you're experiencing?", 0.0

def analyze_sentiment(message):
    """Analyze sentiment of message"""
    message_lower = message.lower()
    
    positive_words = ['good', 'great', 'happy', 'wonderful', 'amazing', 'grateful', 'better', 'improving']
    negative_words = ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'overwhelmed', 'hopeless']
    
    positive_count = sum(1 for word in positive_words if word in message_lower)
    negative_count = sum(1 for word in negative_words if word in message_lower)
    
    if positive_count > negative_count:
        return 'positive'
    elif negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

def detect_emotions(message):
    """Detect emotions in message"""
    message_lower = message.lower()
    
    emotions = {
        'sadness': ['sad', 'depressed', 'down', 'unhappy', 'miserable'],
        'anxiety': ['anxious', 'worried', 'nervous', 'stressed', 'panic'],
        'anger': ['angry', 'frustrated', 'annoyed', 'irritated', 'furious'],
        'happiness': ['happy', 'joyful', 'excited', 'grateful', 'wonderful'],
        'fear': ['afraid', 'scared', 'terrified', 'frightened'],
        'loneliness': ['lonely', 'alone', 'isolated', 'abandoned'],
    }
    
    detected = {}
    for emotion, keywords in emotions.items():
        detected[emotion] = any(keyword in message_lower for keyword in keywords)
    
    return detected

def assess_risk(message):
    """Assess risk level of message"""
    message_lower = message.lower()
    
    crisis_keywords = ['suicide', 'kill myself', 'die', 'end it', 'harm myself', 'self-harm']
    high_risk_keywords = ['hopeless', 'worthless', 'no point', 'give up']
    
    if any(keyword in message_lower for keyword in crisis_keywords):
        return 'critical'
    elif any(keyword in message_lower for keyword in high_risk_keywords):
        return 'high'
    elif any(word in message_lower for word in ['sad', 'depressed', 'anxious', 'stressed']):
        return 'moderate'
    else:
        return 'low'

def detect_crisis(message):
    """Detect if message indicates crisis"""
    return assess_risk(message) in ['critical', 'high']

def get_crisis_resources():
    """Get crisis resources"""
    return [
        {
            'name': 'National Suicide Prevention Lifeline',
            'phone': '988',
            'url': 'https://988lifeline.org',
            'country': 'USA'
        },
        {
            'name': 'Crisis Text Line',
            'phone': 'Text HOME to 741741',
            'url': 'https://www.crisistextline.org',
            'country': 'USA'
        },
        {
            'name': 'International Association for Suicide Prevention',
            'url': 'https://www.iasp.info/resources/Crisis_Centres/',
            'country': 'International'
        }
    ]

def log_conversation(user_id, user_message, bot_response, confidence, sentiment):
    """Log conversation for analytics"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'user_id': user_id,
        'user_message': user_message,
        'bot_response': bot_response,
        'confidence': confidence,
        'sentiment': sentiment
    }
    
    # Append to log file
    try:
        with open('conversation_logs.jsonl', 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    except Exception as e:
        print(f"Error logging conversation: {str(e)}")

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Sahara AI Backend',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint
    Expects: { "message": "user message", "userId": "optional user id" }
    Returns: { "response": "bot response", "confidence": 0.0-1.0, "sentiment": "..." }
    """
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_id = data.get('userId', 'anonymous')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get response using similarity matching
        response, confidence = find_best_match(user_message)
        
        # Analyze sentiment
        sentiment = analyze_sentiment(user_message)
        
        # Log conversation
        log_conversation(user_id, user_message, response, confidence, sentiment)
        
        return jsonify({
            'response': response,
            'confidence': confidence,
            'sentiment': sentiment,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze user message for emotional content
    Expects: { "message": "user message" }
    Returns: { "sentiment": "...", "emotions": {...}, "riskLevel": "..." }
    """
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        sentiment = analyze_sentiment(message)
        emotions = detect_emotions(message)
        risk_level = assess_risk(message)
        
        return jsonify({
            'sentiment': sentiment,
            'emotions': emotions,
            'riskLevel': risk_level,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in analyze endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/crisis-check', methods=['POST'])
def crisis_check():
    """
    Check if message indicates crisis
    Expects: { "message": "user message" }
    Returns: { "isCrisis": boolean, "resources": [...] }
    """
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        is_crisis = detect_crisis(message)
        resources = get_crisis_resources() if is_crisis else []
        
        return jsonify({
            'isCrisis': is_crisis,
            'resources': resources,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in crisis-check endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def analyze_sentiment(message):
    """Analyze sentiment of message"""
    message_lower = message.lower()
    
    positive_words = ['good', 'great', 'happy', 'wonderful', 'amazing', 'grateful', 'better', 'improving']
    negative_words = ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'overwhelmed', 'hopeless']
    
    positive_count = sum(1 for word in positive_words if word in message_lower)
    negative_count = sum(1 for word in negative_words if word in message_lower)
    
    if positive_count > negative_count:
        return 'positive'
    elif negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

def detect_emotions(message):
    """Detect emotions in message"""
    message_lower = message.lower()
    
    emotions = {
        'sadness': ['sad', 'depressed', 'down', 'unhappy', 'miserable'],
        'anxiety': ['anxious', 'worried', 'nervous', 'stressed', 'panic'],
        'anger': ['angry', 'frustrated', 'annoyed', 'irritated', 'furious'],
        'happiness': ['happy', 'joyful', 'excited', 'grateful', 'wonderful'],
        'fear': ['afraid', 'scared', 'terrified', 'frightened'],
        'loneliness': ['lonely', 'alone', 'isolated', 'abandoned'],
    }
    
    detected = {}
    for emotion, keywords in emotions.items():
        detected[emotion] = any(keyword in message_lower for keyword in keywords)
    
    return detected

def assess_risk(message):
    """Assess risk level of message"""
    message_lower = message.lower()
    
    crisis_keywords = ['suicide', 'kill myself', 'die', 'end it', 'harm myself', 'self-harm']
    high_risk_keywords = ['hopeless', 'worthless', 'no point', 'give up']
    
    if any(keyword in message_lower for keyword in crisis_keywords):
        return 'critical'
    elif any(keyword in message_lower for keyword in high_risk_keywords):
        return 'high'
    elif any(word in message_lower for word in ['sad', 'depressed', 'anxious', 'stressed']):
        return 'moderate'
    else:
        return 'low'

def detect_crisis(message):
    """Detect if message indicates crisis"""
    return assess_risk(message) in ['critical', 'high']

def get_crisis_resources():
    """Get crisis resources"""
    return [
        {
            'name': 'National Suicide Prevention Lifeline',
            'phone': '988',
            'url': 'https://988lifeline.org',
            'country': 'USA'
        },
        {
            'name': 'Crisis Text Line',
            'phone': 'Text HOME to 741741',
            'url': 'https://www.crisistextline.org',
            'country': 'USA'
        },
        {
            'name': 'International Association for Suicide Prevention',
            'url': 'https://www.iasp.info/resources/Crisis_Centres/',
            'country': 'International'
        }
    ]

def log_conversation(user_id, user_message, bot_response, confidence, sentiment):
    """Log conversation for analytics"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'user_id': user_id,
        'user_message': user_message,
        'bot_response': bot_response,
        'confidence': confidence,
        'sentiment': sentiment
    }
    
    # Append to log file
    try:
        with open('conversation_logs.jsonl', 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    except Exception as e:
        print(f"Error logging conversation: {str(e)}")

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False') == 'True'
    
    print(f"Starting Sahara AI Backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)
