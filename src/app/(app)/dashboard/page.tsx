"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Heart, MessageCircle, Sparkles, Plus, Calendar, Search, 
  Trash2, Edit3, Save, X, TrendingUp, TrendingDown, Minus, Brain,
  BookOpen, Activity, AlertTriangle, Shield
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePetStore } from "@/stores/pet-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { useChatStore } from "@/stores/chat-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PetDisplay } from "@/components/pet/pet-display";
import { InteractivePet } from "@/components/pet/interactive-pet";
import { Loading } from "@/components/ui/loading";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { 
  analyzeMessage as analyzeSentiment, 
  analyzeProgress,
  getCategoryInfo, 
  type SentimentResult,
  type ProgressData 
} from "@/lib/unified-ai";
import {
  generateDashboardData,
  type SessionData,
  type ComprehensiveDashboardData
} from "@/lib/analytics-engine";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/types";

type TabType = "overview" | "analytics" | "journal";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  sentiment?: SentimentResult;
  createdAt: Date;
  updatedAt: Date;
}

const moodOptions = [
  { emoji: "😊", label: "Happy", color: "bg-yellow-100 text-yellow-700" },
  { emoji: "😌", label: "Calm", color: "bg-green-100 text-green-700" },
  { emoji: "😔", label: "Sad", color: "bg-blue-100 text-blue-700" },
  { emoji: "😤", label: "Frustrated", color: "bg-red-100 text-red-700" },
  { emoji: "😰", label: "Anxious", color: "bg-purple-100 text-purple-700" },
  { emoji: "🤔", label: "Reflective", color: "bg-sage-100 text-sage-700" },
];

const journalPrompts = [
  "What are you grateful for today?",
  "How are you feeling right now?",
  "What's one thing you accomplished today?",
  "What's been on your mind lately?",
  "Describe a moment that made you smile.",
  "What would make tomorrow great?",
];

const demoEntries: JournalEntry[] = [
  {
    id: "1",
    title: "A Good Start",
    content: "Today I woke up feeling refreshed. I took some time to meditate and it really helped set a positive tone for the day. I'm grateful for the small moments of peace.",
    mood: "😌",
    createdAt: new Date(Date.now() - 2 * 86400000),
    updatedAt: new Date(Date.now() - 2 * 86400000),
  },
  {
    id: "2",
    title: "Challenging Day",
    content: "Work was stressful today, but I managed to take breaks and practice deep breathing. Talking to my AI companion helped me process my feelings.",
    mood: "😰",
    createdAt: new Date(Date.now() - 1 * 86400000),
    updatedAt: new Date(Date.now() - 1 * 86400000),
  },
];

const personalityDescriptions: Record<string, string> = {
  calm: "Brings peace and tranquility",
  playful: "Adds joy and lightness",
  grounding: "Helps you stay centered",
  motivating: "Encourages and uplifts you",
};

const personalityColors: Record<string, string> = {
  calm: "bg-soft-blue-100 text-soft-blue-700",
  playful: "bg-amber-100 text-amber-700",
  grounding: "bg-sage-100 text-sage-700",
  motivating: "bg-pink-100 text-pink-700",
};

function getDemoDashboardData(): DashboardData {
  return {
    moodTrends: [
      { date: new Date(Date.now() - 6 * 86400000), moodScore: 6, dominantEmotion: "calm" },
      { date: new Date(Date.now() - 5 * 86400000), moodScore: 7, dominantEmotion: "hopeful" },
      { date: new Date(Date.now() - 4 * 86400000), moodScore: 5, dominantEmotion: "anxious" },
      { date: new Date(Date.now() - 3 * 86400000), moodScore: 7, dominantEmotion: "grateful" },
      { date: new Date(Date.now() - 2 * 86400000), moodScore: 8, dominantEmotion: "peaceful" },
      { date: new Date(Date.now() - 1 * 86400000), moodScore: 7, dominantEmotion: "content" },
      { date: new Date(), moodScore: 8, dominantEmotion: "happy" },
    ],
    chatStreak: 5,
    petBondLevel: 35,
    emotionalKeywords: [
      { word: "grateful", count: 8 },
      { word: "calm", count: 6 },
      { word: "hopeful", count: 5 },
      { word: "peaceful", count: 4 },
      { word: "anxious", count: 3 },
      { word: "happy", count: 3 },
    ],
    totalSessions: 12,
    affirmation: "You are doing great. Every step forward matters.",
  };
}

// Realistic pet images for selection - high quality
const petImages: Record<string, string> = {
  calm: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&crop=face",
  playful: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop&crop=face",
  grounding: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop&crop=face",
  motivating: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=400&h=400&fit=crop&crop=face",
};

// Pet names for display
const petNames: Record<string, string> = {
  calm: "Buddy",
  playful: "Whiskers",
  grounding: "Cotton",
  motivating: "Sunny",
};

export default function DashboardPage() {
  const { user, isDemoMode: isAuthDemoMode } = useAuthStore();
  const { userPet, activePet, pets, fetchPets, selectPet } = usePetStore();
  const { isFullyUnlocked } = useFeatureGateStore();
  const { messages } = useChatStore();
  
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Journal state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  
  // Pet selection state
  const [showInteractivePet, setShowInteractivePet] = useState(false);
  
  // Sentiment analysis state
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [wellnessScore, setWellnessScore] = useState(75);
  const [trend, setTrend] = useState<"improving" | "stable" | "declining">("stable");
  
  // Day counter state
  const [daysWithSahara, setDaysWithSahara] = useState(1);

  const showDashboard = isFullyUnlocked || isDemoMode() || isAuthDemoMode;
  
  // Generate analytics data from chat messages
  const analyticsData = useMemo<ComprehensiveDashboardData | null>(() => {
    if (messages.length === 0) return null;
    
    // Convert chat messages to session data format
    const sessionData: SessionData[] = [{
      id: 'current-session',
      userId: user?.id || 'demo-user',
      startedAt: messages[0]?.createdAt || new Date(),
      endedAt: messages[messages.length - 1]?.createdAt,
      messageCount: messages.length,
      userMessages: messages.filter(m => m.role === 'user').map(m => m.content),
      sentimentScores: messages.filter(m => m.role === 'user').map(m => {
        const sentiment = analyzeSentiment(m.content);
        // Convert wellness score (0-100) to sentiment score (-1 to 1)
        return (sentiment.wellnessScore / 50) - 1;
      }),
      emotionalKeywords: messages.flatMap(m => m.emotionalKeywords || [])
    }];
    
    return generateDashboardData(sessionData, dashboardData?.petBondLevel || 0);
  }, [messages, user?.id, dashboardData?.petBondLevel]);
  
  // Track days with Sahara
  useEffect(() => {
    const firstVisitKey = "sahara-first-visit";
    const stored = localStorage.getItem(firstVisitKey);
    
    if (!stored) {
      localStorage.setItem(firstVisitKey, new Date().toISOString());
      setDaysWithSahara(1);
    } else {
      const firstVisit = new Date(stored);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - firstVisit.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysWithSahara(Math.max(1, diffDays));
    }
  }, []);

  // Load journal entries
  useEffect(() => {
    if (showDashboard) {
      const saved = localStorage.getItem("sahara-journal-entries");
      if (saved) {
        const parsed = JSON.parse(saved);
        const loadedEntries = parsed.map((e: JournalEntry) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        }));
        setEntries(loadedEntries);
      } else {
        // Add sentiment to demo entries
        const entriesWithSentiment = demoEntries.map(e => ({
          ...e,
          sentiment: analyzeSentiment(e.content)
        }));
        setEntries(entriesWithSentiment);
      }
    }
  }, [showDashboard]);

  // Save entries to localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem("sahara-journal-entries", JSON.stringify(entries));
    }
  }, [entries]);

  // Analyze sentiment from journal and chat
  useEffect(() => {
    const journalProgress: ProgressData[] = entries.map(e => ({
      date: e.createdAt,
      sentiment: e.sentiment || analyzeSentiment(e.content),
      source: "journal" as const,
      text: e.content
    }));
    
    const chatProgress: ProgressData[] = messages
      .filter(m => m.role === "user")
      .map(m => ({
        date: new Date(),
        sentiment: analyzeSentiment(m.content),
        source: "chat" as const,
        text: m.content
      }));
    
    const allProgress = [...journalProgress, ...chatProgress].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    
    setProgressData(allProgress);
    
    if (allProgress.length > 0) {
      const analysis = analyzeProgress(allProgress);
      setWellnessScore(analysis.averageWellness);
      setTrend(analysis.trend);
    }
  }, [entries, messages]);

  // Fetch pets
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      if (isDemoMode() || isAuthDemoMode) {
        setDashboardData(getDemoDashboardData());
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { count: sessionCount } = await supabase
          .from("chat_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_completed", true);

        const { data: moodData } = await supabase
          .from("mood_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("recorded_at", { ascending: false })
          .limit(7);

        const { data: messagesData } = await supabase
          .from("chat_messages")
          .select("emotional_keywords")
          .eq("user_id", user.id)
          .not("emotional_keywords", "is", null)
          .order("created_at", { ascending: false })
          .limit(50);

        const keywordCounts: Record<string, number> = {};
        messagesData?.forEach((msg) => {
          msg.emotional_keywords?.forEach((keyword: string) => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          });
        });

        const emotionalKeywords = Object.entries(keywordCounts)
          .map(([word, count]) => ({ word, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        const { data: affirmationData } = await supabase
          .from("affirmations")
          .select("content")
          .limit(1)
          .single();

        const { data: sessionDates } = await supabase
          .from("chat_sessions")
          .select("started_at")
          .eq("user_id", user.id)
          .eq("is_completed", true)
          .order("started_at", { ascending: false });

        let streak = 0;
        if (sessionDates && sessionDates.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          for (const session of sessionDates) {
            const sessionDate = new Date(session.started_at);
            sessionDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / 86400000);
            if (diffDays <= streak + 1) streak++;
            else break;
          }
        }

        setDashboardData({
          moodTrends: moodData?.map((m) => ({
            date: new Date(m.recorded_at),
            moodScore: m.mood_score,
            dominantEmotion: m.dominant_emotion,
          })) || [],
          chatStreak: streak,
          petBondLevel: userPet?.bondLevel || 0,
          emotionalKeywords,
          totalSessions: sessionCount || 0,
          affirmation: affirmationData?.content || "You are doing great. Every step forward matters.",
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData(getDemoDashboardData());
      } finally {
        setIsLoading(false);
      }
    }

    if (showDashboard) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user, showDashboard, userPet?.bondLevel, isAuthDemoMode]);

  // Get random prompt
  useEffect(() => {
    setCurrentPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
  }, [showEditor]);

  // Journal handlers
  const handleSaveEntry = () => {
    if (!title.trim() || !content.trim()) return;

    const sentiment = analyzeSentiment(content);

    if (editingEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingEntry.id
            ? { ...e, title, content, mood: selectedMood, sentiment, updatedAt: new Date() }
            : e
        )
      );
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title,
        content,
        mood: selectedMood || "🤔",
        sentiment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setEntries((prev) => [newEntry, ...prev]);
    }

    resetEditor();
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedMood(entry.mood);
    setShowEditor(true);
  };

  const resetEditor = () => {
    setShowEditor(false);
    setEditingEntry(null);
    setTitle("");
    setContent("");
    setSelectedMood("");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!showDashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-sage-600">
              Complete 10 chat sessions to unlock the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading your wellness data..." />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header with Day Counter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Your Wellness</h1>
          <p className="text-sage-600">Keep growing, one day at a time</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Day Counter Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">{daysWithSahara}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <Calendar className="w-3 h-3 text-amber-800" />
              </div>
            </div>
            <span className="text-[10px] text-sage-500 mt-1 font-medium">
              {daysWithSahara === 1 ? "Day" : "Days"}
            </span>
          </motion.div>
          <div onClick={() => setShowInteractivePet(true)} className="cursor-pointer">
            <PetDisplay size="sm" />
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-1 bg-beige-100 p-1 rounded-xl overflow-x-auto"
      >
        {[
          { id: "overview" as TabType, label: "Overview", icon: Brain },
          { id: "analytics" as TabType, label: "Insights", icon: Activity },
          { id: "journal" as TabType, label: "Journal", icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === id
                ? "bg-white text-sage-800 shadow-sm"
                : "text-sage-500 hover:text-sage-700"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Wellness Score */}
            <Card className="bg-gradient-to-r from-sage-100 to-beige-100 border-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sage-600 mb-1">Wellness Score</p>
                    <p className="text-4xl font-bold text-sage-800">{wellnessScore}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {trend === "improving" && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {trend === "declining" && <TrendingDown className="w-4 h-4 text-red-600" />}
                      {trend === "stable" && <Minus className="w-4 h-4 text-sage-500" />}
                      <span className={cn(
                        "text-sm capitalize",
                        trend === "improving" ? "text-green-600" : 
                        trend === "declining" ? "text-red-600" : "text-sage-500"
                      )}>
                        {trend}
                      </span>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: `conic-gradient(#788A63 ${wellnessScore}%, #E8E4DE ${wellnessScore}%)`
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-sage-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Days Counter */}
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-3 text-center">
                  <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-700">{daysWithSahara}</p>
                  <p className="text-[10px] text-amber-600 font-medium">Days</p>
                </CardContent>
              </Card>

              {/* Chat Streak */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-3 text-center">
                  <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-orange-400/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{dashboardData?.chatStreak || 0}</p>
                  <p className="text-[10px] text-orange-600 font-medium">Streak</p>
                </CardContent>
              </Card>

              {/* Sessions */}
              <Card className="bg-gradient-to-br from-sage-50 to-sage-100 border-sage-200">
                <CardContent className="p-3 text-center">
                  <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-sage-400/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-sage-600" />
                  </div>
                  <p className="text-2xl font-bold text-sage-700">{dashboardData?.totalSessions || 0}</p>
                  <p className="text-[10px] text-sage-600 font-medium">Sessions</p>
                </CardContent>
              </Card>
            </div>

            {/* Pet Bond */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-sage-600 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Bond with {activePet?.name || "your companion"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-600">Level {Math.floor((dashboardData?.petBondLevel || 0) / 10) + 1}</span>
                    <span className="text-sage-500">{dashboardData?.petBondLevel || 0}/100</span>
                  </div>
                  <div className="h-3 bg-beige-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${dashboardData?.petBondLevel || 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emotional Keywords */}
            {dashboardData?.emotionalKeywords && dashboardData.emotionalKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-sage-600">
                    Your Emotional Landscape
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.emotionalKeywords.map((keyword, index) => (
                      <motion.span
                        key={keyword.word}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="px-3 py-1.5 bg-sage-100 text-sage-700 rounded-full text-sm"
                      >
                        {keyword.word}
                      </motion.span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Engagement Health Index */}
            <Card className="bg-gradient-to-r from-sage-100 to-emerald-50 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-sage-600 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sage-500" />
                  Engagement Health Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-sage-800">
                      {analyticsData?.engagementHealth.overallScore || 50}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {analyticsData?.engagementHealth.trend === "improving" && (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                      {analyticsData?.engagementHealth.trend === "declining" && (
                        <TrendingDown className="w-4 h-4 text-amber-600" />
                      )}
                      {analyticsData?.engagementHealth.trend === "stable" && (
                        <Minus className="w-4 h-4 text-sage-500" />
                      )}
                      <span className={cn(
                        "text-sm capitalize",
                        analyticsData?.engagementHealth.trend === "improving" ? "text-green-600" : 
                        analyticsData?.engagementHealth.trend === "declining" ? "text-amber-600" : "text-sage-500"
                      )}>
                        {analyticsData?.engagementHealth.trend || "stable"}
                      </span>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: `conic-gradient(#788A63 ${analyticsData?.engagementHealth.overallScore || 50}%, #E8E4DE ${analyticsData?.engagementHealth.overallScore || 50}%)`
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                        <Shield className="w-6 h-6 text-sage-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sub-scores */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-sage-500">Consistency</p>
                    <p className="text-lg font-semibold text-sage-700">
                      {analyticsData?.engagementHealth.consistencyScore || 50}%
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-sage-500">Depth</p>
                    <p className="text-lg font-semibold text-sage-700">
                      {analyticsData?.engagementHealth.depthScore || 50}%
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-sage-500">Stability</p>
                    <p className="text-lg font-semibold text-sage-700">
                      {analyticsData?.engagementHealth.sentimentStabilityScore || 50}%
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-sage-500">Quality</p>
                    <p className="text-lg font-semibold text-sage-700">
                      {analyticsData?.engagementHealth.interactionQualityScore || 50}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Trajectory */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-sage-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sage-500" />
                  Sentiment Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-sage-800">
                      {((analyticsData?.sentimentTrajectory.averageSentiment || 0) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-sage-500">Average Positivity</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    analyticsData?.sentimentTrajectory.trend === "improving" 
                      ? "bg-green-100 text-green-700"
                      : analyticsData?.sentimentTrajectory.trend === "declining"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-sage-100 text-sage-700"
                  )}>
                    {analyticsData?.sentimentTrajectory.trend === "improving" && "↑ Improving"}
                    {analyticsData?.sentimentTrajectory.trend === "declining" && "↓ Needs attention"}
                    {analyticsData?.sentimentTrajectory.trend === "stable" && "→ Stable"}
                  </div>
                </div>
                
                {/* Simple visual representation */}
                <div className="h-2 bg-beige-200 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      analyticsData?.sentimentTrajectory.trend === "improving" 
                        ? "bg-gradient-to-r from-sage-400 to-green-500"
                        : analyticsData?.sentimentTrajectory.trend === "declining"
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-sage-400 to-sage-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(10, ((analyticsData?.sentimentTrajectory.averageSentiment || 0) + 1) * 50)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pet Bond Level */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-sage-600 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Companion Bond
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-sage-800">
                      {analyticsData?.petBond.bondLevel || dashboardData?.petBondLevel || 0}%
                    </p>
                    <div className="h-2 bg-beige-200 rounded-full overflow-hidden mt-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${analyticsData?.petBond.bondLevel || dashboardData?.petBondLevel || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Bond breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-sage-700">
                      +{analyticsData?.petBond.consistencyBonus || 0}
                    </p>
                    <p className="text-[10px] text-sage-500">Consistency</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-sage-700">
                      +{analyticsData?.petBond.emotionalOpennessBonus || 0}
                    </p>
                    <p className="text-[10px] text-sage-500">Openness</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-sage-700">
                      +{analyticsData?.petBond.positiveMomentsBonus || 0}
                    </p>
                    <p className="text-[10px] text-sage-500">Positivity</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emotional Keywords */}
            {analyticsData?.emotionalKeywords.keywords && analyticsData.emotionalKeywords.keywords.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-sage-600">
                    Emotional Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analyticsData.emotionalKeywords.keywords.slice(0, 8).map((keyword, index) => (
                      <motion.span
                        key={keyword.word}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm flex items-center gap-1",
                          keyword.trend === "up" ? "bg-green-100 text-green-700" :
                          keyword.trend === "down" ? "bg-amber-100 text-amber-700" :
                          "bg-sage-100 text-sage-700"
                        )}
                      >
                        {keyword.word}
                        {keyword.trend === "up" && <TrendingUp className="w-3 h-3" />}
                        {keyword.trend === "down" && <TrendingDown className="w-3 h-3" />}
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-xs text-sage-500 mt-3">
                    Dominant theme: <span className="font-medium capitalize">{analyticsData.emotionalKeywords.dominantCategory}</span>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Wellness Signals */}
            {analyticsData?.riskSignals && analyticsData.riskSignals.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Wellness Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsData.riskSignals.slice(0, 2).map((signal, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg">
                        <p className="text-sm text-sage-700">{signal.suggestedAction}</p>
                        <p className="text-xs text-sage-500 mt-1">
                          {signal.indicators.slice(0, 2).join(" • ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Card */}
            {analyticsData?.summary && (
              <Card className="bg-gradient-to-r from-beige-100 to-sage-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-sage-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-sage-800">
                        {analyticsData.summary.positiveHighlight || "Keep going! Every conversation helps build your wellness journey."}
                      </p>
                      {analyticsData.summary.primaryConcern && (
                        <p className="text-xs text-sage-600 mt-1">
                          {analyticsData.summary.primaryConcern}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No data message */}
            {!analyticsData && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Activity className="w-12 h-12 text-sage-300 mx-auto mb-3" />
                  <p className="text-sage-600">Start chatting to see your insights</p>
                  <p className="text-sage-400 text-sm mt-1">
                    Your analytics will appear here as you have more conversations
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === "journal" && (
          <motion.div
            key="journal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Journal Header */}
            <div className="flex items-center justify-between">
              <p className="text-sage-600">Reflect on your journey</p>
              <Button onClick={() => setShowEditor(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Entry
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-beige-200 rounded-xl text-sage-800 placeholder:text-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-300"
              />
            </div>

            {/* Entries List */}
            <div className="space-y-3">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sage-500">No journal entries yet.</p>
                  <p className="text-sage-400 text-sm mt-1">Start writing to track your thoughts.</p>
                </div>
              ) : (
                filteredEntries.map((entry, index) => {
                  const sentimentInfo = entry.sentiment ? getCategoryInfo(entry.sentiment.category) : null;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{entry.mood}</span>
                                <h3 className="font-semibold text-sage-800 truncate">{entry.title}</h3>
                              </div>
                              <p className="text-sage-600 text-sm line-clamp-2 mb-2">{entry.content}</p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1 text-sage-400">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(entry.createdAt)}
                                </span>
                                {sentimentInfo && (
                                  <span className={cn("px-2 py-0.5 rounded-full", sentimentInfo.bgColor, sentimentInfo.color)}>
                                    {sentimentInfo.emoji} {sentimentInfo.label}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="p-2 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-2 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Pet Modal */}
      <InteractivePet 
        isOpen={showInteractivePet} 
        onClose={() => setShowInteractivePet(false)} 
      />

      {/* Journal Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={resetEditor}
        title={editingEntry ? "Edit Entry" : "New Journal Entry"}
      >
        <div className="space-y-4">
          {/* Prompt suggestion */}
          {!editingEntry && (
            <div className="p-3 bg-sage-50 rounded-lg flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-sage-600 italic">{currentPrompt}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="w-full px-3 py-2 bg-white border border-beige-200 rounded-lg text-sage-800 placeholder:text-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          {/* Mood selector */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">How are you feeling?</label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.emoji}
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm transition-all",
                    selectedMood === mood.emoji
                      ? mood.color + " ring-2 ring-offset-1 ring-sage-400"
                      : "bg-beige-100 text-sage-600 hover:bg-beige-200"
                  )}
                >
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Your thoughts</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely..."
              rows={6}
              className="w-full px-3 py-2 bg-white border border-beige-200 rounded-lg text-sage-800 placeholder:text-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={resetEditor} className="flex-1">
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSaveEntry} className="flex-1" disabled={!title.trim() || !content.trim()}>
              <Save className="w-4 h-4 mr-1" />
              {editingEntry ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
