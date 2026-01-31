# Sahara – Complete Tech Stack (Detailed)

Sahara is a mental wellness companion web app. This document describes the full technology stack used in the product.

---

## 1. Frontend

### 1.1 Core Framework & Runtime
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework: App Router, SSR/SSG, API routes, middleware |
| **React** | 19.2.3 | UI library |
| **React DOM** | 19.2.3 | React DOM renderer |
| **TypeScript** | ^5 | Static typing, path aliases (`@/*` → `src/*`) |

- **App Router**: Routes under `src/app/` (landing `page.tsx`, `(app)/` for authenticated app, `api/`, `auth/`).
- **Middleware**: `middleware.ts` runs on matched routes; uses Supabase `updateSession` for auth/session refresh.

### 1.2 Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | ^4 | Utility-first CSS; used via `@import "tailwindcss"` in `globals.css` |
| **PostCSS** | `@tailwindcss/postcss` ^4 | Tailwind PostCSS integration |
| **CSS Variables** | Custom | Theming in `globals.css`: `--primary`, `--accent`, `--bg`, `--text`, dark mode overrides |
| **class-variance-authority (cva)** | ^0.7.1 | Variant-based component APIs (e.g. button variants) |
| **clsx** | ^2.1.1 | Conditional class names |
| **tailwind-merge** | ^3.4.0 | Merging Tailwind classes without conflicts |

- **Design tokens**: Primary teal (`#2d5a6b`), accent coral (`#e85a3c`), neutrals; dark mode via `.dark`.
- **Fonts**: Google Fonts – DM Sans (sans), Playfair Display (serif), loaded in root `layout.tsx`.

### 1.3 UI Components & Icons
| Technology | Version | Purpose |
|------------|---------|---------|
| **lucide-react** | ^0.562.0 | Icon set (Shield, Heart, Sparkles, MessageCircle, etc.) |
| **Custom components** | — | `src/components/ui/`: Button, Card, Input, Textarea, Modal, Avatar, Loading, PageHeader, ThemeToggle |

- Reusable UI lives in `src/components/ui/`; feature-specific components in `components/auth/`, `components/chat/`, `components/community/`, `components/crisis/`, `components/pet/`, etc.

### 1.4 Animation & Data Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| **Framer Motion** | ^12.23.26 | Page and card animations, `whileInView`, `AnimatePresence`, layout transitions |
| **d3** | ^7.9.0 | Data viz (e.g. community connection graph) |
| **@types/d3** | ^7.4.3 | TypeScript types for d3 |

- Next config uses `optimizePackageImports` for `lucide-react`, `framer-motion`, and `d3`.

---

## 2. State Management & Data Fetching

| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | ^5.0.9 | Global client state: auth, chat, pets, feature gates, theme |
| **TanStack React Query** | ^5.90.16 | Server state, caching, `QueryClient` in `Providers` |

### Stores (Zustand)
- **auth-store**: Sign in/up (Supabase Auth), session, demo mode, `isAuthenticated`, `user`.
- **chat-store**: Messages, send message, call `/api/chat`, pet animation state.
- **pet-store**: Pets list, user’s active pet, bond level, fetch from Supabase.
- **feature-gate-store**: Unlock state (e.g. after N chats), `isFullyUnlocked`.
- **theme-store**: Light/dark theme persistence.

---

## 3. Backend & API

### 3.1 Next.js API Routes
- **`/api/chat`** (`src/app/api/chat/route.ts`): Main chat endpoint.
  - Reads `messages` and optional `userId`.
  - Runs local NLP (sentiment, crisis detection).
  - AI priority: Chirag (Groq) → Dialogflow → local unified-ai.
  - Returns content, sentiment, suggested pet animation, crisis resources if needed.

### 3.2 Authentication
- **Supabase Auth**: Email/password; session in cookies via `@supabase/ssr`.
- **Supabase middleware** (`src/lib/supabase/middleware.ts`): Refreshes session on request; used by `middleware.ts`.
- **Auth callback**: `src/app/auth/callback/route.ts` for OAuth/code exchange if used.
- **Local auth helpers**: `src/lib/local-auth.ts` for demo or fallback auth logic.

---

## 4. Database (Supabase)

| Component | Purpose |
|-----------|---------|
| **Supabase (PostgreSQL)** | Primary database and auth |
| **@supabase/supabase-js** | ^2.89.0 – client (browser) |
| **@supabase/ssr** | ^0.8.0 – server/client with cookies for Next.js |

### Main Tables (from `supabase/schema.sql`)
- **auth.users** – Supabase-managed users.
- **user_profiles** – Name, anonymous_name (Sahara ID), age, sex, etc.
- **feature_gates** – e.g. `completed_chats`, `unlocked_at`.
- **unlocked_features** – Per-user feature flags.
- **pets** – Pet definitions (name, personality, image_url, animation_config, ai_tone_modifier).
- **user_pets** – User’s selected pet, bond level, `is_active`.
- **chat_sessions** – Session metadata per user.
- **chat_messages** – Messages per session (content, role, emotional_keywords).

Additional schema/seed files: `learning_schema.sql`, `learning_seed.sql`, `pet_auth_schema.sql`, etc.

---

## 5. AI & NLP Stack

### 5.1 Chat AI Pipeline (in `/api/chat`)
1. **Local NLP** (`src/lib/nlp.ts`): Sentiment, emotions, themes, keywords, crisis detection (always on).
2. **Chirag / Groq** (`src/lib/chirag-service.ts`):
   - `isChiragEnabled()`: true if `CHIRAG_API_URL` or `GROQ_API_KEY` is set.
   - `chatWithChiragAI()`: Calls Groq API (`llama-3.1-70b-versatile`) with Chirag-style system prompt and conversation history.
   - Optional: `chatWithChirag()` to hit Chirag FastAPI backend at `CHIRAG_API_URL`.
3. **Dialogflow** (`src/lib/dialogflow-nlp.ts`):
   - `@google-cloud/dialogflow` ^7.4.0.
   - Intent detection and fulfillment; optional agent name (e.g. “chirag”); uses `DIALOGFLOW_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`.
4. **Unified AI (fallback)** (`src/lib/unified-ai.ts`): Local therapeutic responses, crisis handling, pet-aware prompts; can use **OpenAI** (`openai` ^6.15.0) if `OPENAI_API_KEY` is set.

### 5.2 Other AI / Logic Modules
- **unified-ai.ts**: System prompt, response generation, therapeutic approach, suggested pet animation.
- **therapeutic-ai.ts** / **enhanced-therapeutic-ai.ts**: Therapeutic response logic.
- **sentiment-analyzer.ts**: Sentiment and emotional analysis.
- **nlp.ts**: Text analysis used by chat pipeline.
- **adaptive-pet-ai.ts**: Pet personality and context-aware replies (e.g. pets page).
- **cbt-engine.ts**: CBT-style exercises/patterns.
- **habit-coach.ts**: Habit suggestions.
- **journal-analysis-engine.ts**: Journal insights.
- **wellness-insights-engine.ts**: Wellness metrics/insights.
- **assessment-engine.ts**: Assessments logic.
- **community-learning-engine.ts**: Learning content and structure for community.

---

## 6. External Services & Integrations

| Service | Purpose | Env / Config |
|---------|---------|---------------|
| **Supabase** | Auth, PostgreSQL, optional storage | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Groq** | Chirag AI (LLM) | `GROQ_API_KEY` |
| **OpenAI** | Optional LLM for unified-ai | `OPENAI_API_KEY` |
| **Google Dialogflow** | Optional intent/fulfillment | `DIALOGFLOW_PROJECT_ID`, `DIALOGFLOW_AGENT_NAME`, `GOOGLE_APPLICATION_CREDENTIALS` |
| **Chirag FastAPI backend** | Optional external Chirag API | `CHIRAG_API_URL`, `NEXT_PUBLIC_CHIRAG_API_URL`, `CHIRAG_API_KEY` |
| **Twilio** | SMS crisis alerts, notifications | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `ALERT_PHONE_NUMBER` (see `src/lib/sms-service.ts`) |
| **JotForm AI (Luna)** | Embedded chat widget (post-login) | Script in `src/components/noupe-script.tsx` (embed ID in script URL) |
| **Pexels** | Hero background video | Video URL in `src/app/page.tsx` |
| **Unsplash** | Images (e.g. community) | Allowed in `next.config.ts` `images.remotePatterns` |

---

## 7. Optional Python AI Backend

| Component | Purpose |
|-----------|---------|
| **Location** | `ai_backend/` |
| **Framework** | Flask 3.x, flask-cors |
| **Libraries** | python-dotenv, requests |
| **Role** | Alternative wellness chatbot with rule-based + similarity responses; crisis handling; can be used as Chirag backend via `CHIRAG_API_URL` |

---

## 8. Build, Dev & Quality

| Tool | Version | Purpose |
|------|---------|---------|
| **Node** | (project default) | Runtime for Next.js |
| **npm** | — | Package manager (see `package-lock.json`) |
| **ESLint** | ^9 | Linting |
| **eslint-config-next** | 16.1.1 | Next.js ESLint rules |
| **TypeScript** | ^5 | Compiler; strict mode; `moduleResolution: "bundler"` |

### Next.js Config Highlights
- **Images**: AVIF/WebP; device/size config; `remotePatterns` for Unsplash.
- **Experimental**: `optimizePackageImports` for tree-shaking.
- **Compiler**: `removeConsole` in production.

### Scripts
- `npm run dev` – Next dev server (port 1996).
- `npm run build` – Production build.
- `npm run start` – Production start.
- `npm run lint` – ESLint.

---

## 9. Project Structure (Summary)

```
sahara/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing (hero, video, How It Works, etc.)
│   │   ├── layout.tsx          # Root layout, fonts, providers
│   │   ├── globals.css         # Tailwind + CSS variables + dark mode
│   │   ├── (app)/              # Authenticated app (dashboard, community, pets, …)
│   │   ├── api/chat/           # Chat API
│   │   ├── auth/               # Auth callback, auth-code-error
│   │   └── profile-setup/      # Post-signup profile
│   ├── components/             # React components (ui, auth, chat, community, pet, crisis, …)
│   ├── lib/                    # Services: Supabase, AI, NLP, SMS, pet, habits, etc.
│   ├── stores/                 # Zustand stores
│   └── types/                  # Shared TypeScript types
├── supabase/                   # SQL schema and seeds
├── ai_backend/                 # Optional Flask AI backend
├── public/                     # Static assets (incl. pet audio)
├── middleware.ts               # Session/auth middleware
├── next.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.mjs
```

---

## 10. Summary Table

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, CSS variables, cva, clsx, tailwind-merge |
| **UI / Motion** | lucide-react, Framer Motion, d3 |
| **State** | Zustand, TanStack React Query |
| **Backend** | Next.js API routes (Node), optional Flask (Python) |
| **Database** | Supabase (PostgreSQL + Auth) |
| **AI / NLP** | Groq (Chirag), Dialogflow, OpenAI (optional), local unified-ai, sentiment & crisis detection |
| **Integrations** | Twilio (SMS), JotForm (Luna widget), Pexels, Unsplash |

This is the full tech stack that powers Sahara end-to-end.
