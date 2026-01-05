# SAHARA 2.0 - Comprehensive Mental Wellness Platform

## 📋 Table of Contents
1. [Overview](#overview)
2. [Application Architecture](#application-architecture)
3. [Features & Functionality](#features--functionality)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Feature Details](#feature-details)
7. [Setup & Installation](#setup--installation)
8. [Deployment](#deployment)

---

## Overview

**SAHARA 2.0** is a revolutionary mental wellness platform designed to provide comprehensive support for mental health through AI-powered therapy, evidence-based tools, community connection, and innovative pet therapy. The application operates in demo mode (no Supabase required) and can be scaled to production with Supabase integration.

### Key Principles
- **Accessibility**: Available to everyone, works offline in demo mode
- **Evidence-Based**: Uses CBT, mindfulness, and therapeutic techniques
- **Non-Diagnostic**: Never diagnoses or replaces professional care
- **Supportive**: Encourages help-seeking and crisis support
- **Innovative**: Revolutionary pet therapy system never implemented before

---

## Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SAHARA 2.0 Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Frontend (Next.js + React)                 │   │
│  │  - Chat Interface                                    │   │
│  │  - Pet Therapy System                                │   │
│  │  - CBT Tools                                         │   │
│  │  - Assessments                                       │   │
│  │  - Community Hub                                     │   │
│  │  - Habit Coach                                       │   │
│  │  - Educational Content                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        State Management (Zustand Stores)             │   │
│  │  - Auth Store                                        │   │
│  │  - Chat Store                                        │   │
│  │  - Pet Store                                         │   │
│  │  - Feature Gate Store                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Core Libraries & Engines                     │   │
│  │  - Enhanced Therapeutic AI                           │   │
│  │  - CBT Engine                                        │   │
│  │  - Pet Therapy System                                │   │
│  │  - Assessment Engine                                 │   │
│  │  - Habit Coach                                       │   │
│  │  - Analytics Engine                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Storage & Backend                               │   │
│  │  - LocalStorage (Demo Mode)                          │   │
│  │  - Supabase (Production)                             │   │
│  │  - API Routes                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Feature Gate System

The app uses a progressive unlock system:
- **Initial State**: Only Chat is available
- **After 10 Chat Sessions**: All features unlock (Pets, Tools, Dashboard, Community, Profile, Habits, Learn, Assessments)

---

## Features & Functionality

### 1. **AI Therapy Chat** 🤖
**Status**: ✅ Complete

The core feature providing personalized therapeutic conversations.

**Capabilities**:
- Multiple therapeutic techniques (validation, reflection, reframing, grounding, exploration)
- Emotional analysis and response
- Crisis detection with immediate support
- Pet integration (pet reacts to emotional content)
- Session tracking and history
- Demo mode with localStorage persistence

**Files**:
- `sahara/src/lib/enhanced-therapeutic-ai.ts` - AI engine
- `sahara/src/lib/therapeutic-ai.ts` - Analysis utilities
- `sahara/src/stores/chat-store.ts` - Chat state management
- `sahara/src/app/api/chat/route.ts` - API endpoint
- `sahara/src/components/chat/` - Chat UI components

**How It Works**:
1. User sends message
2. System analyzes emotional content
3. AI generates therapeutic response using multiple techniques
4. Pet reacts to emotional intensity
5. Message stored in session
6. After 10 messages (5 exchanges), session marked complete

---

### 2. **Revolutionary Pet Therapy System** 🐾
**Status**: ✅ Complete

A unique pet system that evolves based on user interaction and emotional state.

**Features**:
- **Two Pets**: Buddy (Dog) and Whiskers (Cat)
- **Emotional Intelligence**: Pets respond to user emotions
- **Evolution Stages**: Baby → Young → Adult → Wise
- **Bond Levels**: Increase through interaction
- **Therapeutic Activities**:
  - Guided breathing with pet animation
  - Mindful walks
  - Comfort sessions
  - Play therapy
- **Memory System**: Pets remember user patterns
- **Unique Abilities**: Unlock at different bond levels

**Files**:
- `sahara/src/lib/pet-therapy-system.ts` - Pet logic
- `sahara/src/stores/pet-store.ts` - Pet state
- `sahara/src/components/pet/interactive-pet.tsx` - Pet UI
- `sahara/src/components/pet/pet-display.tsx` - Pet display
- `sahara/src/app/(app)/pets/page.tsx` - Pets page

**Pet Mechanics**:
```
Bond Level → Emotional State → Abilities Unlocked
0-20       → Curious         → Basic interactions
20-40      → Friendly        → Breathing exercises
40-60      → Bonded          → Mindful activities
60-80      → Devoted         → Therapeutic guidance
80-100     → Wise            → Advanced support
```

---

### 3. **CBT Tools** 🧠
**Status**: ✅ Complete

Evidence-based Cognitive Behavioral Therapy tools for thought management.

**Tools Included**:
- **Thought Record**: Capture situation → thought → emotion → alternative thought
- **Cognitive Distortions**: Identify thinking patterns (catastrophizing, black/white thinking, etc.)
- **Behavioral Activation**: Schedule and track mood-boosting activities
- **Worry Time**: Structured worry management
- **Gratitude Practice**: Daily gratitude exercises
- **Exposure Hierarchy**: Gradual exposure to anxiety triggers

**Files**:
- `sahara/src/lib/cbt-engine.ts` - CBT logic
- `sahara/src/app/(app)/tools/page.tsx` - Tools UI

**How It Works**:
1. User selects a CBT tool
2. Guided form captures relevant information
3. System analyzes and provides insights
4. Progress tracked over time
5. Encouragement provided for consistency

---

### 4. **Mental Health Assessments** 📊
**Status**: ✅ Complete

Validated screening tools for self-assessment (non-diagnostic).

**Assessments**:
- **PHQ-9**: Depression screening (9 questions)
- **GAD-7**: Anxiety screening (7 questions)
- **PSS**: Perceived Stress Scale (10 questions)

**Features**:
- Validated scoring algorithms
- Result interpretation (mild, moderate, severe)
- History tracking
- Trend visualization
- Recommendations for support

**Files**:
- `sahara/src/lib/assessment-engine.ts` - Assessment logic
- `sahara/src/app/(app)/assessments/page.tsx` - Assessment UI

**Important**: Assessments are for self-awareness only, not diagnosis.

---

### 5. **Crisis Support** 🆘
**Status**: ✅ Complete

Always-accessible emergency support system.

**Features**:
- **Floating Emergency Button**: Accessible from all screens
- **Crisis Detection**: AI detects crisis keywords in chat
- **Grounding Exercises**:
  - 5-4-3-2-1 sensory grounding
  - Breathing exercises
  - Body scan
- **Crisis Resources**:
  - 988 Suicide & Crisis Lifeline (USA)
  - Crisis Text Line (Text HOME to 741741)
  - International resources
- **Immediate Support**: One-tap access to resources

**Files**:
- `sahara/src/components/crisis/emergency-button.tsx` - Emergency button
- `sahara/src/components/chat/crisis-alert.tsx` - Crisis alerts

---

### 6. **Habit Coach** 🎯
**Status**: ✅ Complete

Build and maintain healthy wellness habits with tracking and encouragement.

**Features**:
- **Habit Creation**: 9 categories (mindfulness, exercise, sleep, social, nutrition, gratitude, journaling, breathing, self-care)
- **Streak Tracking**: Current and longest streaks
- **Daily Check-ins**: Mark habits complete
- **Progress Visualization**: Weekly and category breakdowns
- **Suggestions**: AI-recommended habits based on user profile
- **Encouragement**: Milestone celebrations and motivational messages
- **Statistics**: Total completions, category breakdown, progress trends

**Files**:
- `sahara/src/lib/habit-coach.ts` - Habit logic
- `sahara/src/app/(app)/habits/page.tsx` - Habits UI

**Habit Categories**:
- 🧘 Mindfulness
- 💪 Exercise
- 😴 Sleep
- 👥 Social
- 🥗 Nutrition
- 🙏 Gratitude
- 📝 Journaling
- 🌬️ Breathing
- 💚 Self-Care

---

### 7. **Educational Content** 📚
**Status**: ✅ Complete

Curated mental wellness education to expand knowledge and skills.

**Content Topics**:
- Understanding Anxiety
- Effective Stress Management
- Better Sleep Habits
- Introduction to Mindfulness
- Lifting Your Mood
- Building Healthy Relationships

**Features**:
- **Categorized Content**: 6 main categories
- **Read Time Estimates**: Know how long each article takes
- **Practical Exercises**: Step-by-step exercises within articles
- **Quick Tips**: Actionable advice
- **Progress Tracking**: Mark articles as complete
- **Completion Stats**: See learning progress

**Files**:
- `sahara/src/app/(app)/learn/page.tsx` - Learn UI

---

### 8. **Community Hub** 👥
**Status**: ✅ Complete

Connect with others, share experiences, and find support.

**Features**:
- **Feed**: Share positive messages and experiences
- **Support Groups**: Join groups by topic (anxiety, stress, mindfulness, etc.)
- **Challenges**: Participate in wellness challenges
- **Resources**: Access wellness resources
- **Reactions**: React to posts with supportive emojis
- **Anonymous**: All usernames are anonymous for privacy
- **Peer Network**: Visualize connections between community members

**Files**:
- `sahara/src/app/(app)/community/page.tsx` - Community UI
- `sahara/src/components/community/connection-graph.tsx` - Network visualization

---

### 9. **Dashboard & Analytics** 📈
**Status**: ✅ Complete

Comprehensive wellness tracking and insights.

**Metrics**:
- Chat sessions completed
- Mood trends
- Habit streaks
- Assessment scores over time
- Pet bond level
- Community engagement
- Learning progress

**Files**:
- `sahara/src/lib/analytics-engine.ts` - Analytics logic
- `sahara/src/app/(app)/dashboard/page.tsx` - Dashboard UI

---

### 10. **User Profile** 👤
**Status**: ✅ Complete

Personalization and account management.

**Features**:
- Anonymous username generation
- Pet selection (Buddy or Whiskers)
- Wellness goals
- Preferences
- Session history
- Statistics

**Files**:
- `sahara/src/app/(app)/profile/page.tsx` - Profile UI

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **UI Components**: Custom components + shadcn/ui

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) - Optional
- **Storage**: LocalStorage (Demo Mode)
- **Authentication**: Supabase Auth - Optional

### Development
- **Package Manager**: npm
- **Build Tool**: Next.js
- **Linting**: ESLint
- **Formatting**: Prettier

### Deployment
- **Hosting**: Vercel (recommended)
- **Database**: Supabase
- **Environment**: Node.js 18+

---

## Project Structure

```
sahara/
├── src/
│   ├── app/
│   │   ├── (app)/                          # Protected routes
│   │   │   ├── layout.tsx                  # App layout with nav
│   │   │   ├── page.tsx                    # Chat page
│   │   │   ├── pets/page.tsx               # Pet therapy
│   │   │   ├── tools/page.tsx              # CBT tools
│   │   │   ├── assessments/page.tsx        # Mental health assessments
│   │   │   ├── dashboard/page.tsx          # Analytics dashboard
│   │   │   ├── community/page.tsx          # Community hub
│   │   │   ├── profile/page.tsx            # User profile
│   │   │   ├── habits/page.tsx             # Habit coach
│   │   │   └── learn/page.tsx              # Educational content
│   │   ├── auth/
│   │   │   └── callback/route.ts           # OAuth callback
│   │   ├── api/
│   │   │   └── chat/route.ts               # Chat API
│   │   ├── page.tsx                        # Landing page
│   │   └── globals.css                     # Global styles
│   ├── components/
│   │   ├── auth/                           # Auth components
│   │   ├── chat/                           # Chat UI components
│   │   ├── pet/                            # Pet components
│   │   ├── crisis/                         # Crisis support
│   │   ├── community/                      # Community components
│   │   ├── navigation/                     # Navigation
│   │   └── ui/                             # Reusable UI components
│   ├── lib/
│   │   ├── enhanced-therapeutic-ai.ts      # AI engine
│   │   ├── therapeutic-ai.ts               # AI utilities
│   │   ├── cbt-engine.ts                   # CBT tools
│   │   ├── pet-therapy-system.ts           # Pet system
│   │   ├── assessment-engine.ts            # Assessments
│   │   ├── habit-coach.ts                  # Habit tracking
│   │   ├── analytics-engine.ts             # Analytics
│   │   ├── sentiment-analyzer.ts           # Sentiment analysis
│   │   ├── utils.ts                        # Utilities
│   │   └── supabase/                       # Supabase client
│   ├── stores/
│   │   ├── auth-store.ts                   # Auth state
│   │   ├── chat-store.ts                   # Chat state
│   │   ├── pet-store.ts                    # Pet state
│   │   └── feature-gate-store.ts           # Feature unlock state
│   └── types/
│       └── index.ts                        # TypeScript types
├── public/
│   └── logo.png                            # App logo
├── supabase/
│   ├── schema.sql                          # Database schema
│   └── seed.sql                            # Sample data
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Feature Details

### AI Therapy Engine

The enhanced therapeutic AI uses multiple techniques:

1. **Validation**: Acknowledging and normalizing feelings
2. **Reflection**: Mirroring back what the user said
3. **Reframing**: Offering alternative perspectives
4. **Grounding**: Bringing focus to present moment
5. **Exploration**: Asking clarifying questions
6. **Encouragement**: Providing support and motivation
7. **Normalization**: Showing that feelings are common
8. **Psychoeducation**: Teaching about mental health

### Pet Therapy Innovation

The pet system is revolutionary because:
- **Emotional Intelligence**: Pets genuinely respond to user emotions
- **Memory**: Pets remember user patterns and preferences
- **Evolution**: Pets grow and change based on interaction
- **Therapeutic Integration**: Pets participate in therapy sessions
- **Unique Abilities**: Different abilities unlock at bond levels
- **Non-Judgmental Support**: Pets provide unconditional support

### Crisis Detection

The system detects crisis keywords and immediately:
1. Alerts the user
2. Provides grounding exercises
3. Offers crisis resources
4. Enables emergency button
5. Suggests professional help

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/sahara2.0.git
cd sahara

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3847
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Demo Mode

The app works perfectly in demo mode without any environment variables:
- All data stored in localStorage
- No Supabase required
- Full feature access after 10 chat sessions

---

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# 1. Go to vercel.com
# 2. Import your GitHub repository
# 3. Add environment variables
# 4. Deploy
```

### Production Checklist

- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Set up authentication
- [ ] Configure CORS
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups

---

## Key Metrics & Analytics

The app tracks:
- **User Engagement**: Chat sessions, feature usage
- **Mental Health Trends**: Mood patterns, assessment scores
- **Habit Formation**: Streaks, completion rates
- **Community Activity**: Posts, reactions, group participation
- **Pet Bonding**: Bond levels, interaction frequency

---

## Security & Privacy

- **Anonymous**: All usernames are anonymous
- **Encrypted**: Data encrypted in transit
- **Local Storage**: Demo mode uses only browser storage
- **No Diagnosis**: Never diagnoses mental illness
- **Crisis Support**: Always provides professional resources
- **GDPR Compliant**: Respects user privacy

---

## Future Enhancements

- [ ] Video therapy sessions
- [ ] Voice-based interactions
- [ ] Wearable integration
- [ ] Advanced analytics
- [ ] Therapist dashboard
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Multi-language support
- [ ] Advanced AI models
- [ ] Integration with health apps

---

## Support & Resources

- **Crisis Hotline**: 988 (USA)
- **Crisis Text Line**: Text HOME to 741741
- **Documentation**: See README.md
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## License

MIT License - See LICENSE file for details

---

## Contributors

Built with ❤️ for mental wellness

---

**Last Updated**: January 2026
**Version**: 2.0.0
**Status**: Production Ready
