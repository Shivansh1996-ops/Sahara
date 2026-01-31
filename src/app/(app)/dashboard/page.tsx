"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Brain, BookOpen, Activity, 
  Target, Sun, Moon, Droplets, Wind, Bed, Apple, 
  CheckCircle2, Sparkles, Lightbulb, BarChart3, 
  Heart, Phone, MessageCircle, Play, Clock, Shield,
  X, Plus, ChevronRight, Calendar, Award, PenLine, FileText
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analyzeJournalEntry, getEmotionColor, type FullJournalAnalysis } from "@/lib/journal-analysis-engine";

interface DailyHabit {
  id: string;
  name: string;
  icon: typeof Sun;
  completed: boolean;
  color: string;
}

interface Exercise {
  id: string;
  name: string;
  progress: number;
  duration: string;
  category: string;
  icon: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  analysis?: FullJournalAnalysis;
  createdAt: Date;
}

const moodOptions = [
  { emoji: "😊", label: "Great", value: 5 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😔", label: "Low", value: 2 },
  { emoji: "😢", label: "Struggling", value: 1 },
];

const getInitialHabits = (): DailyHabit[] => [
  { id: "water", name: "Drink Water", icon: Droplets, completed: false, color: "#3b82f6" },
  { id: "exercise", name: "Move Body", icon: Activity, completed: false, color: "#22c55e" },
  { id: "breathe", name: "Deep Breaths", icon: Wind, completed: false, color: "#8b5cf6" },
  { id: "sleep", name: "Good Sleep", icon: Bed, completed: false, color: "#6366f1" },
  { id: "nutrition", name: "Eat Well", icon: Apple, completed: false, color: "#f59e0b" },
  { id: "mindful", name: "Mindfulness", icon: Brain, completed: false, color: "#ec4899" },
];

const exercises: Exercise[] = [
  { id: "1", name: "Gratitude Journal", progress: 98, duration: "6h 32min", category: "Positive thinking", icon: "📝" },
  { id: "2", name: "Deep Breathing", progress: 75, duration: "2h 15min", category: "Stress relief", icon: "🌬️" },
  { id: "3", name: "Mindful Walking", progress: 55, duration: "1h 40min", category: "Mindfulness", icon: "🚶" },
  { id: "4", name: "Body Scan", progress: 40, duration: "45min", category: "Relaxation", icon: "🧘" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const { user, profile } = useAuthStore();
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [habits, setHabits] = useState<DailyHabit[]>(getInitialHabits());
  const [weeklyMoods, setWeeklyMoods] = useState([65, 72, 58, 80, 75, 85, 0]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  
  // Journal state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", content: "", mood: "😊" });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Load saved data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedMood = localStorage.getItem("sahara-mood-today");
    const savedHabits = localStorage.getItem("sahara-habits-today");
    const savedJournal = localStorage.getItem("sahara-journal-entries");
    
    if (savedMood) {
      try {
        const moodData = JSON.parse(savedMood);
        const today = new Date().toDateString();
        if (moodData.date === today) {
          setTodayMood(moodData.value);
          setWeeklyMoods(prev => [...prev.slice(0, 6), moodData.value * 20]);
        }
      } catch {}
    }
    
    if (savedHabits) {
      try {
        const habitsData = JSON.parse(savedHabits);
        const today = new Date().toDateString();
        if (habitsData.date === today) {
          setHabits(habitsData.habits.map((h: DailyHabit) => ({
            ...h,
            icon: getInitialHabits().find(ih => ih.id === h.id)?.icon || Sun
          })));
        }
      } catch {}
    }

    if (savedJournal) {
      try {
        const entries = JSON.parse(savedJournal);
        setJournalEntries(entries.map((e: JournalEntry) => ({
          ...e,
          createdAt: new Date(e.createdAt)
        })));
      } catch {}
    }
  }, []);

  // Save habits
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toDateString();
      const habitsToSave = habits.map(h => ({ id: h.id, name: h.name, completed: h.completed, color: h.color }));
      localStorage.setItem("sahara-habits-today", JSON.stringify({ date: today, habits: habitsToSave }));
    }
  }, [habits]);

  // Save journal entries
  useEffect(() => {
    if (typeof window !== 'undefined' && journalEntries.length > 0) {
      localStorage.setItem("sahara-journal-entries", JSON.stringify(journalEntries));
    }
  }, [journalEntries]);

  const completedHabits = habits.filter(h => h.completed).length;
  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const handleMoodSelect = (value: number) => {
    setTodayMood(value);
    setWeeklyMoods(prev => [...prev.slice(0, 6), value * 20]);
    localStorage.setItem("sahara-mood-today", JSON.stringify({ date: new Date().toDateString(), value }));
    setShowMoodPicker(false);
  };

  const handleSaveJournal = () => {
    if (newEntry.title && newEntry.content) {
      const content = newEntry.content;
      const analysis = analyzeJournalEntry(content, journalEntries.map(e => e.content));
      const entry: JournalEntry = {
        id: Date.now().toString(),
        ...newEntry,
        analysis,
        createdAt: new Date()
      };
      setJournalEntries([entry, ...journalEntries]);
      setNewEntry({ title: "", content: "", mood: "😊" });
      setShowJournalModal(false);
      
      // Send alert for serious content
      fetch("/api/journal/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, userId: user?.id, userName: profile?.name }),
      }).catch(() => {});
    }
  };

  const stats = [
    { 
      title: "Progress Tracking", 
      value: completedHabits, 
      change: "+15%", 
      positive: true,
      subtitle: "Goals achieved this week",
      color: "from-blue-500/10 to-cyan-500/10",
      barColor: "bg-blue-500",
      progress: (completedHabits / habits.length) * 100
    },
    { 
      title: "Educational Sources", 
      value: 12, 
      change: "+30%", 
      positive: true,
      subtitle: "Articles & exercises completed",
      color: "from-purple-500/10 to-pink-500/10",
      items: ["Breathing techniques", "Stress management"],
      barColor: "bg-purple-500"
    },
    { 
      title: "Wellness Sessions", 
      value: 6, 
      change: "+5%", 
      positive: true,
      subtitle: "Sessions this month",
      color: "from-emerald-500/10 to-teal-500/10",
      barColor: "bg-emerald-500",
      progress: 60
    },
  ];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="pt-6 pb-6"
        >
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">
              Hey, {profile?.name || "Friend"}! <span className="inline-block animate-bounce">🙌</span>
            </h1>
          </div>
          <p className="text-[var(--text-muted)] mt-1 ml-10">Glad to have you back</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-white/10 shadow-sm`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text)]">{stat.title}</h3>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                  stat.positive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                )}>
                  {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--text)] mb-1">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">{stat.subtitle}</p>
              
              {stat.progress !== undefined && (
                <div className="h-2 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${stat.barColor} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              )}
              
              {stat.items && (
                <div className="space-y-1.5 mt-2">
                  {stat.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Emotional State Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-white/10 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)]">Emotional State</h3>
                <p className="text-xs text-[var(--text-muted)]">Based on your daily check-ins and activities</p>
              </div>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {["Week", "Month", "Year"].map((period, idx) => (
                  <button
                    key={period}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      idx === 0 ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--text)]" : "text-[var(--text-muted)]"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-40 mb-2">
              {weeklyMoods.map((mood, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden h-32 flex items-end">
                    <motion.div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${mood}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">{weekDays[i]}</span>
                </div>
              ))}
            </div>

            {/* Mood Check-in */}
            {!todayMood && (
              <motion.button
                onClick={() => setShowMoodPicker(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Today&apos;s Mood
              </motion.button>
            )}
          </motion.div>

          {/* Urgent Support Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-5 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Urgent Support</h3>
              <p className="text-white/80 text-sm mb-4">Quick access to crisis hotlines when you need immediate help</p>
              
              <Link href="/consult">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl">
                  Get help now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* My Exercises Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-white/10 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">My Exercises</h3>
              <p className="text-xs text-[var(--text-muted)]">Activities to support your mental health journey</p>
            </div>
            <Link href="/tools">
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                View all <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {exercises.map((exercise, i) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-xl shadow-sm">
                  {exercise.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[var(--text)] text-sm">{exercise.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${exercise.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{exercise.progress}%</span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-[var(--text-muted)]">{exercise.duration}</p>
                  <p className="text-[10px] text-[var(--text-light)]">{exercise.category}</p>
                </div>
                <Play className="w-4 h-4 text-[var(--text-muted)]" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Journal Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 dark:border-white/10 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">My Journal</h3>
              <p className="text-xs text-[var(--text-muted)]">Track your thoughts and emotions</p>
            </div>
            <Button 
              onClick={() => setShowJournalModal(true)}
              className="rounded-xl text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              <PenLine className="w-3 h-3 mr-1" /> Write Entry
            </Button>
          </div>

          {journalEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No journal entries yet</p>
              <p className="text-xs text-[var(--text-light)]">Start writing to track your thoughts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journalEntries.slice(0, 3).map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-[var(--text)] text-sm">{entry.title}</h4>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {entry.createdAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.analysis && (
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${getEmotionColor(entry.analysis.emotional.primaryTone)}20`,
                            color: getEmotionColor(entry.analysis.emotional.primaryTone)
                          }}
                        >
                          {entry.analysis.emotional.primaryTone}
                        </span>
                      )}
                      <span className="text-lg">{entry.mood}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{entry.content}</p>
                </motion.div>
              ))}
              {journalEntries.length > 3 && (
                <p className="text-xs text-center text-[var(--text-muted)]">
                  + {journalEntries.length - 3} more entries
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "Talk to Luna", icon: MessageCircle, color: "from-violet-500 to-purple-600", href: "/chat" },
            { title: "CBT Tools", icon: Brain, color: "from-emerald-500 to-teal-600", href: "/tools" },
            { title: "Learn", icon: BookOpen, color: "from-amber-500 to-orange-600", href: "/learn" },
            { title: "Community", icon: Heart, color: "from-pink-500 to-rose-600", href: "/community" },
          ].map((action, i) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br ${action.color} rounded-2xl p-4 text-white cursor-pointer shadow-lg`}
              >
                <action.icon className="w-6 h-6 mb-2" />
                <p className="font-semibold text-sm">{action.title}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mood Picker Modal */}
      <AnimatePresence>
        {showMoodPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text)]">How are you feeling?</h3>
                <button onClick={() => setShowMoodPicker(false)}>
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
              <div className="flex justify-between gap-2">
                {[
                  { emoji: "😢", label: "Bad", value: 1 },
                  { emoji: "😔", label: "Low", value: 2 },
                  { emoji: "😐", label: "Okay", value: 3 },
                  { emoji: "🙂", label: "Good", value: 4 },
                  { emoji: "😊", label: "Great", value: 5 },
                ].map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood.value)}
                    className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <span className="text-3xl">{mood.emoji}</span>
                    <span className="text-xs text-[var(--text-muted)]">{mood.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Entry Modal */}
      <AnimatePresence>
        {showJournalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-indigo-500" />
                  New Journal Entry
                </h3>
                <button onClick={() => setShowJournalModal(false)}>
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Give your entry a title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[var(--text)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">How are you feeling?</label>
                  <div className="flex gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.emoji}
                        onClick={() => setNewEntry({ ...newEntry, mood: mood.emoji })}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xl transition-all",
                          newEntry.mood === mood.emoji 
                            ? "bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500 scale-110" 
                            : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">Your thoughts</label>
                  <textarea
                    placeholder="Write freely about how you're feeling, what's on your mind..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[var(--text)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    AI will analyze your entry for emotional patterns and insights
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveJournal}
                    disabled={!newEntry.title || !newEntry.content}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Save Entry
                  </Button>
                  <Button
                    onClick={() => setShowJournalModal(false)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
