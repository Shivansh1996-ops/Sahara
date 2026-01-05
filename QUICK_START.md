# SAHARA 2.0 - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd sahara
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
```
http://localhost:3847
```

---

## 📱 Demo Mode

The app works perfectly in demo mode:
- ✅ No Supabase needed
- ✅ All data in localStorage
- ✅ Full feature access after 10 chat sessions
- ✅ Perfect for testing and development

---

## 🎯 First Time User Flow

1. **Landing Page**: Click "Start Your Journey"
2. **Profile Creation**: Choose name and pet (Buddy or Whiskers)
3. **Chat**: Start talking to your AI therapist
4. **After 10 Messages**: All features unlock!
5. **Explore**: Try Pets, Tools, Assessments, Community, Habits, Learn

---

## 🔑 Key Features to Try

### Chat (Always Available)
- Talk to your AI therapist
- Get emotional support
- Watch your pet react

### Pets (After Unlock)
- Interact with Buddy or Whiskers
- Do therapeutic activities
- Build bond level

### CBT Tools (After Unlock)
- Thought Records
- Cognitive Distortions
- Behavioral Activation
- Worry Time
- Gratitude Practice
- Exposure Hierarchy

### Assessments (After Unlock)
- PHQ-9 (Depression)
- GAD-7 (Anxiety)
- PSS (Stress)

### Habits (After Unlock)
- Create habits
- Track streaks
- Get suggestions
- View statistics

### Learn (After Unlock)
- Read articles
- Do exercises
- Get tips
- Track progress

### Community (After Unlock)
- Share messages
- Join groups
- Participate in challenges
- View resources

### Dashboard (After Unlock)
- See your stats
- Track progress
- View trends

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

---

## 📁 Important Files

- `sahara/src/app/page.tsx` - Landing page
- `sahara/src/app/(app)/page.tsx` - Chat page
- `sahara/src/lib/enhanced-therapeutic-ai.ts` - AI engine
- `sahara/src/lib/pet-therapy-system.ts` - Pet system
- `sahara/src/stores/chat-store.ts` - Chat state
- `sahara/src/stores/pet-store.ts` - Pet state

---

## 🎨 Customization

### Change Logo
Replace `sahara/public/logo.png` with your logo

### Change Colors
Edit `sahara/src/app/globals.css` and `tailwind.config.ts`

### Change Pet Names
Edit `sahara/src/lib/pet-therapy-system.ts`

### Change Habits
Edit `sahara/src/lib/habit-coach.ts`

### Change Content
Edit `sahara/src/app/(app)/learn/page.tsx`

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3848
```

### Clear Cache
```bash
# Delete .next folder
rm -rf .next

# Reinstall
npm install
npm run dev
```

### localStorage Issues
```bash
# Open DevTools (F12)
# Go to Application → Local Storage
# Clear all entries
# Refresh page
```

---

## 📊 Testing Features

### Test Chat
1. Go to Chat page
2. Send 10 messages (5 exchanges)
3. Features should unlock

### Test Pet
1. Go to Pets page
2. Click on pet
3. Do activities
4. Watch bond level increase

### Test Habits
1. Go to Habits page
2. Create a habit
3. Mark complete
4. See streak increase

### Test Assessments
1. Go to Assessments page
2. Take PHQ-9
3. See results
4. Take again to see history

---

## 🚀 Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Go to vercel.com
# Import repository
# Deploy
```

---

## 📚 Documentation

- `SAHARA_2.0_DOCUMENTATION.md` - Complete documentation
- `PROJECT_SUMMARY.md` - Project overview
- `GITHUB_SETUP.md` - GitHub setup
- `.kiro/specs/` - Detailed specs

---

## 💡 Tips

- Use Chrome DevTools to inspect components
- Check localStorage to see data persistence
- Try different pets to see different personalities
- Create multiple habits to see category breakdown
- Read all educational content
- Join all support groups
- Participate in challenges

---

## 🎯 Next Steps

1. ✅ Run locally
2. ✅ Test all features
3. ✅ Customize as needed
4. ✅ Push to GitHub
5. ✅ Deploy to Vercel
6. ✅ Share with users

---

## 📞 Need Help?

- Check `SAHARA_2.0_DOCUMENTATION.md`
- Review `.kiro/specs/` for detailed info
- Check GitHub Issues
- Read code comments

---

**Happy coding! 🚀**

Version: 2.0.0
Status: Production Ready
