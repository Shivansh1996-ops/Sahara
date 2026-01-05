"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Check, Flame, Trophy, Calendar, Target, 
  Sparkles, ChevronRight, Clock, TrendingUp
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import {
  type Habit,
  type HabitCategory,
  type HabitSuggestion,
  createHabit,
  completeHabit,
  isCompletedToday,
  getHabitProgress,
  getEncouragementMessage,
  getSuggestedHabits,
  categoryInfo,
  habitSuggestions
} from "@/lib/habit-coach";

const STORAGE_KEY = "sahara-habits";

export default function HabitsPage() {
  const { user, isDemoMode: isAuthDemoMode } = useAuthStore();
  const { isFullyUnlocked } = useFeatureGateStore();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDescription, setNewHabitDescription] = useState("");
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "all" | "stats">("today");

  // Load habits from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setHabits(parsed.map((h: Habit) => ({
        ...h,
        createdAt: new Date(h.createdAt),
        completions: h.completions.map((c: { completedAt: string | Date }) => ({
          ...c,
          completedAt: new Date(c.completedAt)
        }))
      })));
    }
    setIsLoading(false);
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoading]);

  const handleCreateHabit = () => {
    if (!newHabitName.trim() || !selectedCategory) return;
    
    const habit = createHabit(
      newHabitName.trim(),
      newHabitDescription.trim(),
      selectedCategory
    );
    
    setHabits(prev => [...prev, habit]);
    setNewHabitName("");
    setNewHabitDescription("");
    setSelectedCategory(null);
    setShowNewHabitModal(false);
  };

  const handleAddSuggestion = (suggestion: HabitSuggestion) => {
    const habit = createHabit(
      suggestion.name,
      suggestion.description,
      suggestion.category
    );
    setHabits(prev => [...prev, habit]);
    setShowSuggestionsModal(false);
  };

  const handleCompleteHabit = (habitId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      if (isCompletedToday(h)) return h;
      
      const previousStreak = h.streak;
      const updated = completeHabit(h);
      const message = getEncouragementMessage(updated.streak, previousStreak);
      setEncouragementMessage(message);
      setTimeout(() => setEncouragementMessage(null), 4000);
      
      return updated;
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const todayHabits = habits.filter(h => h.isActive);
  const completedToday = todayHabits.filter(h => isCompletedToday(h)).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

  const existingCategories = habits.map(h => h.category);
  const suggestions = getSuggestedHabits(existingCategories);

  if (!isFullyUnlocked && !isAuthDemoMode) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <Target className="w-12 h-12 text-sage-300 mx-auto mb-3" />
            <p className="text-sage-600">Complete 10 chat sessions to unlock habit tracking.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loading size="lg" text="Loading habits..." /></div>;
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50/50 via-beige-50 to-soft-blue-50/30 pb-24">
      {/* Encouragement Toast */}
      <AnimatePresence>
        {encouragementMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-50 bg-sage-600 text-white p-4 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <p className="font-medium">{encouragementMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-sage-600 via-sage-500 to-emerald-500 px-4 py-6 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Habit Coach</span>
          </div>
          <h1 className="text-xl font-bold mb-1">Build Better Habits</h1>
          <p className="text-white/80 text-sm">Small steps lead to big changes</p>

          {/* Stats */}
          <div className="flex gap-3 mt-4">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <Check className="w-4 h-4" />
              <span className="text-sm">{completedToday}/{todayHabits.length} today</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-sm">{totalStreak} streak</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span className="text-sm">{longestStreak} best</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-beige-100 rounded-xl">
          {[
            { id: "today" as const, label: "Today", icon: Calendar },
            { id: "all" as const, label: "All Habits", icon: Target },
            { id: "stats" as const, label: "Stats", icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                activeTab === id
                  ? "bg-white text-sage-800 shadow-sm"
                  : "text-sage-500 hover:text-sage-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={() => setShowNewHabitModal(true)} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            New Habit
          </Button>
          <Button variant="outline" onClick={() => setShowSuggestionsModal(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            Suggestions
          </Button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "today" && (
            <motion.div
              key="today"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {todayHabits.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <Target className="w-12 h-12 text-sage-300 mx-auto mb-3" />
                    <p className="text-sage-600 mb-4">No habits yet. Start building healthy routines!</p>
                    <Button onClick={() => setShowSuggestionsModal(true)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Suggestions
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                todayHabits.map((habit, index) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={() => handleCompleteHabit(habit.id)}
                    onDelete={() => handleDeleteHabit(habit.id)}
                    delay={index * 0.05}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === "all" && (
            <motion.div
              key="all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {Object.entries(categoryInfo).map(([category, info]) => {
                const categoryHabits = habits.filter(h => h.category === category);
                if (categoryHabits.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-lg">{info.icon}</span>
                      <span className="font-medium text-sage-700">{info.name}</span>
                      <span className="text-sm text-sage-500">({categoryHabits.length})</span>
                    </div>
                    {categoryHabits.map((habit, index) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onComplete={() => handleCompleteHabit(habit.id)}
                        onDelete={() => handleDeleteHabit(habit.id)}
                        delay={index * 0.05}
                      />
                    ))}
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-sage-600" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-sage-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-sage-700">{habits.length}</p>
                      <p className="text-sm text-sage-500">Total Habits</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-amber-700">{habits.reduce((sum, h) => sum + h.totalCompletions, 0)}</p>
                      <p className="text-sm text-amber-600">Completions</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-orange-700">{totalStreak}</p>
                      <p className="text-sm text-orange-600">Current Streak</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-emerald-700">{longestStreak}</p>
                      <p className="text-sm text-emerald-600">Best Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">By Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(categoryInfo).map(([category, info]) => {
                    const count = habits.filter(h => h.category === category).length;
                    if (count === 0) return null;
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <span className="text-xl">{info.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sage-700">{info.name}</p>
                          <div className="h-2 bg-beige-100 rounded-full mt-1">
                            <div
                              className="h-full bg-sage-500 rounded-full"
                              style={{ width: `${(count / habits.length) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-sage-500">{count}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Habit Modal */}
      <Modal
        isOpen={showNewHabitModal}
        onClose={() => setShowNewHabitModal(false)}
        title="Create New Habit"
        description="Build a healthy routine"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Habit Name</label>
            <Input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g., Morning meditation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Description (optional)</label>
            <Textarea
              value={newHabitDescription}
              onChange={(e) => setNewHabitDescription(e.target.value)}
              placeholder="What does this habit involve?"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(categoryInfo).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as HabitCategory)}
                  className={cn(
                    "p-2 rounded-lg border-2 transition-all text-center",
                    selectedCategory === key
                      ? "border-sage-500 bg-sage-50"
                      : "border-beige-200 hover:border-sage-300"
                  )}
                >
                  <span className="text-xl">{info.icon}</span>
                  <p className="text-xs text-sage-600 mt-1">{info.name}</p>
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleCreateHabit}
            disabled={!newHabitName.trim() || !selectedCategory}
            className="w-full"
          >
            Create Habit
          </Button>
        </div>
      </Modal>

      {/* Suggestions Modal */}
      <Modal
        isOpen={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
        title="Suggested Habits"
        description="Start with these wellness habits"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAddSuggestion(suggestion)}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{categoryInfo[suggestion.category].icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sage-800">{suggestion.name}</h4>
                      <p className="text-sm text-sage-500">{suggestion.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-sage-100 text-sage-600 px-2 py-0.5 rounded-full">
                          {suggestion.difficulty}
                        </span>
                        <span className="text-xs text-sage-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {suggestion.timeRequired} min
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-sage-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

interface HabitCardProps {
  habit: Habit;
  onComplete: () => void;
  onDelete: () => void;
  delay: number;
}

function HabitCard({ habit, onComplete, onDelete, delay }: HabitCardProps) {
  const progress = getHabitProgress(habit);
  const completed = progress.completedToday;
  const info = categoryInfo[habit.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={cn("transition-all", completed && "bg-sage-50/50")}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onComplete}
              disabled={completed}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                completed
                  ? "bg-sage-500 text-white"
                  : "border-2 border-sage-300 hover:border-sage-500 hover:bg-sage-50"
              )}
            >
              {completed ? <Check className="w-5 h-5" /> : <span className="text-lg">{info.icon}</span>}
            </button>
            <div className="flex-1">
              <h4 className={cn("font-medium", completed ? "text-sage-500 line-through" : "text-sage-800")}>
                {habit.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {habit.streak > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {habit.streak} day streak
                  </span>
                )}
                <span className="text-xs text-sage-400">
                  {progress.completedThisWeek}/{progress.weeklyGoal} this week
                </span>
              </div>
            </div>
            <button
              onClick={onDelete}
              className="p-2 text-sage-400 hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-beige-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-sage-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
