# 🌿 Sahara - Mental Wellness Companion

A calming mental wellness web application centered around an AI companion (virtual pet) that users emotionally connect with. Features are progressively unlocked to avoid overwhelming users and encourage consistent engagement.

![Sahara Preview](./preview.png)

## ✨ Features

### Core Experience
- **AI Chat Companion** - Full-screen chat interface with an empathetic AI wellness companion
- **Virtual Pet System** - Animated plant companion with personality-based interactions
- **Progressive Unlocking** - Features unlock after 10 meaningful conversations

### Unlockable Features
- **Pet Selection** - Choose from multiple companions with unique personalities (calm, playful, grounding, motivating)
- **Wellness Dashboard** - Track mood trends, chat streaks, and emotional patterns
- **Peer Community** - Anonymous supportive space with connection graphs

### Safety Features
- **Crisis Detection** - Automatic detection of crisis keywords with helpline resources
- **Clear AI Boundaries** - AI clearly states it's not a medical professional
- **Encrypted Medical History** - Optional private health information storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
cd sahara
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:
   - Copy contents of `supabase/schema.sql` and execute
   - Copy contents of `supabase/seed.sql` and execute
3. Enable Google OAuth in Authentication > Providers
4. Get your project URL and anon key from Settings > API

### 3. Configure Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom calm color palette
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth + Email)
- **AI**: OpenAI GPT-4o-mini
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
sahara/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/             # Authenticated app routes
│   │   │   ├── dashboard/     # Wellness dashboard
│   │   │   ├── pets/          # Pet selection
│   │   │   ├── community/     # Peer community
│   │   │   └── profile/       # User profile
│   │   ├── api/               # API routes
│   │   │   └── chat/          # AI chat endpoint
│   │   └── auth/              # Auth callback
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── chat/             # Chat interface components
│   │   ├── pet/              # Pet display components
│   │   ├── auth/             # Authentication components
│   │   └── navigation/       # Navigation components
│   ├── stores/               # Zustand stores
│   ├── lib/                  # Utilities and Supabase clients
│   └── types/                # TypeScript types
├── supabase/
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Seed data (pets, affirmations)
└── public/                   # Static assets
```

## 🎨 Design System

### Color Palette
- **Sage Green**: Primary color for calm, nature-inspired feel
- **Beige**: Warm neutral backgrounds
- **Soft Blue**: Accent color for highlights

### Typography
- **Font**: Nunito - Rounded, friendly typeface

### Components
- Rounded corners (2xl radius)
- Soft shadows
- Micro-animations
- Mobile-first responsive design

## 🔒 Security

- Row Level Security (RLS) on all tables
- Encrypted medical history storage
- Anonymous usernames in community
- No direct messaging (safety first)
- Crisis detection with helpline resources

## 📱 Progressive Feature Unlock

| Chats Completed | Features Available |
|-----------------|-------------------|
| 0-9 | AI Chat, Basic Profile |
| 10+ | Pet Selection, Dashboard, Community, Full Profile |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own wellness projects!

---

Built with 💚 for mental wellness
