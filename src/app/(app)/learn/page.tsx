"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Play, Clock, CheckCircle, ChevronRight, 
  Brain, Heart, Moon, Sparkles, Wind, Users, Smile,
  ArrowLeft, BookmarkPlus, Share2
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

// Educational content categories
const categories = [
  { id: "anxiety", name: "Anxiety", icon: "💭", color: "bg-blue-100 text-blue-600" },
  { id: "stress", name: "Stress", icon: "🌊", color: "bg-teal-100 text-teal-600" },
  { id: "depression", name: "Low Mood", icon: "🌧️", color: "bg-indigo-100 text-indigo-600" },
  { id: "sleep", name: "Sleep", icon: "🌙", color: "bg-purple-100 text-purple-600" },
  { id: "mindfulness", name: "Mindfulness", icon: "🧘", color: "bg-sage-100 text-sage-600" },
  { id: "relationships", name: "Relationships", icon: "💚", color: "bg-pink-100 text-pink-600" },
];

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  content: string[];
  exercises?: { title: string; steps: string[] }[];
  tips?: string[];
}

const articles: Article[] = [
  {
    id: "understanding-anxiety",
    title: "Understanding Anxiety",
    description: "Learn what anxiety is and how it affects your mind and body",
    category: "anxiety",
    readTime: 5,
    content: [
      "Anxiety is a natural response to stress. It's your body's way of alerting you to potential threats. While some anxiety is normal and even helpful, excessive anxiety can interfere with daily life.",
      "When you feel anxious, your body activates the 'fight or flight' response. This causes physical symptoms like rapid heartbeat, sweating, and muscle tension. Understanding this can help you recognize anxiety when it happens.",
      "Anxiety becomes a problem when it's persistent, excessive, or interferes with your daily activities. Common anxiety disorders include generalized anxiety disorder, social anxiety, and panic disorder.",
      "The good news is that anxiety is highly treatable. Techniques like deep breathing, mindfulness, and cognitive behavioral therapy (CBT) can help manage anxiety effectively."
    ],
    exercises: [
      {
        title: "4-7-8 Breathing",
        steps: [
          "Breathe in quietly through your nose for 4 seconds",
          "Hold your breath for 7 seconds",
          "Exhale completely through your mouth for 8 seconds",
          "Repeat this cycle 3-4 times"
        ]
      }
    ],
    tips: [
      "Practice deep breathing when you notice anxiety building",
      "Challenge anxious thoughts by asking 'Is this thought realistic?'",
      "Regular exercise can significantly reduce anxiety levels",
      "Limit caffeine and alcohol, which can worsen anxiety"
    ]
  },
  {
    id: "managing-stress",
    title: "Effective Stress Management",
    description: "Practical strategies to reduce and manage daily stress",
    category: "stress",
    readTime: 6,
    content: [
      "Stress is your body's response to demands or challenges. While short-term stress can be motivating, chronic stress can harm your physical and mental health.",
      "Common sources of stress include work pressures, relationship issues, financial concerns, and major life changes. Identifying your stress triggers is the first step to managing them.",
      "Your body responds to stress by releasing hormones like cortisol and adrenaline. Over time, chronic stress can lead to health problems including headaches, sleep issues, and weakened immunity.",
      "Effective stress management involves both reducing stressors when possible and building resilience to handle unavoidable stress better."
    ],
    exercises: [
      {
        title: "Progressive Muscle Relaxation",
        steps: [
          "Find a comfortable position and close your eyes",
          "Starting with your feet, tense the muscles for 5 seconds",
          "Release and notice the feeling of relaxation",
          "Move up through each muscle group: legs, abdomen, chest, arms, face",
          "End by taking several deep breaths"
        ]
      }
    ],
    tips: [
      "Break large tasks into smaller, manageable steps",
      "Set boundaries and learn to say no when needed",
      "Make time for activities you enjoy",
      "Connect with supportive friends and family"
    ]
  },
  {
    id: "improving-sleep",
    title: "Better Sleep Habits",
    description: "Create healthy sleep patterns for improved wellbeing",
    category: "sleep",
    readTime: 5,
    content: [
      "Quality sleep is essential for mental health. During sleep, your brain processes emotions, consolidates memories, and repairs itself.",
      "Most adults need 7-9 hours of sleep per night. However, sleep quality matters as much as quantity. Interrupted or light sleep doesn't provide the same benefits as deep, restful sleep.",
      "Poor sleep can worsen anxiety, depression, and stress. It also affects concentration, decision-making, and emotional regulation.",
      "Good sleep hygiene involves creating habits and an environment that promote consistent, quality sleep."
    ],
    exercises: [
      {
        title: "Sleep Preparation Routine",
        steps: [
          "Set a consistent bedtime and wake time",
          "Dim lights 1-2 hours before bed",
          "Avoid screens for at least 30 minutes before sleep",
          "Do a relaxing activity like reading or gentle stretching",
          "Keep your bedroom cool, dark, and quiet"
        ]
      }
    ],
    tips: [
      "Avoid caffeine after 2 PM",
      "Exercise regularly, but not close to bedtime",
      "Use your bed only for sleep (not work or scrolling)",
      "If you can't sleep after 20 minutes, get up and do something calming"
    ]
  },
  {
    id: "mindfulness-basics",
    title: "Introduction to Mindfulness",
    description: "Learn the fundamentals of mindful awareness",
    category: "mindfulness",
    readTime: 7,
    content: [
      "Mindfulness is the practice of paying attention to the present moment without judgment. It involves noticing your thoughts, feelings, and sensations as they are, without trying to change them.",
      "Research shows that regular mindfulness practice can reduce stress, anxiety, and depression. It can also improve focus, emotional regulation, and overall wellbeing.",
      "Mindfulness isn't about emptying your mind or achieving a special state. It's simply about being present and aware. When your mind wanders (which it will), you gently bring it back.",
      "You can practice mindfulness anywhere, anytime. Even a few minutes of mindful breathing or awareness can make a difference."
    ],
    exercises: [
      {
        title: "5-Minute Mindfulness",
        steps: [
          "Sit comfortably and close your eyes",
          "Focus on your breath - notice the sensation of breathing",
          "When thoughts arise, acknowledge them and return to your breath",
          "Notice any sounds, sensations, or feelings without judgment",
          "After 5 minutes, slowly open your eyes"
        ]
      }
    ],
    tips: [
      "Start with just 2-3 minutes of practice daily",
      "Use everyday activities as mindfulness opportunities (eating, walking)",
      "Be patient - mindfulness is a skill that develops over time",
      "There's no 'right' way to feel during practice"
    ]
  },
  {
    id: "lifting-mood",
    title: "Lifting Your Mood",
    description: "Evidence-based strategies for improving low mood",
    category: "depression",
    readTime: 6,
    content: [
      "Low mood is something everyone experiences at times. It can be triggered by life events, stress, or sometimes appear without an obvious cause.",
      "When you're feeling down, it's common to withdraw from activities and people. However, this often makes low mood worse. Behavioral activation - doing activities even when you don't feel like it - is one of the most effective strategies.",
      "Your thoughts also play a big role in mood. Negative thinking patterns can create a cycle that maintains low mood. Learning to notice and challenge these thoughts can help break the cycle.",
      "Small, consistent actions often work better than trying to make big changes all at once. Even tiny steps in the right direction can start to shift your mood."
    ],
    exercises: [
      {
        title: "Mood-Boosting Activity",
        steps: [
          "Choose one small activity you used to enjoy",
          "Schedule a specific time to do it today",
          "Do the activity even if you don't feel motivated",
          "Notice how you feel before, during, and after",
          "Repeat with different activities throughout the week"
        ]
      }
    ],
    tips: [
      "Get outside and move your body, even briefly",
      "Connect with someone, even if just a text message",
      "Practice self-compassion - treat yourself as you would a friend",
      "Maintain basic self-care: sleep, nutrition, hygiene"
    ]
  },
  {
    id: "healthy-relationships",
    title: "Building Healthy Relationships",
    description: "Nurture meaningful connections with others",
    category: "relationships",
    readTime: 5,
    content: [
      "Healthy relationships are essential for mental wellbeing. Social connection provides support, meaning, and a sense of belonging.",
      "Good relationships are built on mutual respect, trust, and communication. They involve both giving and receiving support.",
      "Setting boundaries is an important part of healthy relationships. Boundaries help you maintain your wellbeing while staying connected to others.",
      "It's normal for relationships to have challenges. What matters is how you navigate difficulties together and whether the relationship is generally positive and supportive."
    ],
    tips: [
      "Practice active listening - give your full attention",
      "Express appreciation and gratitude regularly",
      "Be willing to have difficult conversations with kindness",
      "Make time for meaningful connection, not just surface interaction"
    ]
  }
];

const STORAGE_KEY = "sahara-learn-progress";

export default function LearnPage() {
  const { isDemoMode: isAuthDemoMode } = useAuthStore();
  const { isFullyUnlocked } = useFeatureGateStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [completedArticles, setCompletedArticles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCompletedArticles(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedArticles));
    }
  }, [completedArticles, isLoading]);

  const markAsComplete = (articleId: string) => {
    if (!completedArticles.includes(articleId)) {
      setCompletedArticles(prev => [...prev, articleId]);
    }
  };

  const filteredArticles = selectedCategory
    ? articles.filter(a => a.category === selectedCategory)
    : articles;

  if (!isFullyUnlocked && !isAuthDemoMode) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <BookOpen className="w-12 h-12 text-sage-300 mx-auto mb-3" />
            <p className="text-sage-600">Complete 10 chat sessions to unlock educational content.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loading size="lg" text="Loading content..." /></div>;
  }

  // Article Detail View
  if (selectedArticle) {
    return (
      <ArticleView
        article={selectedArticle}
        isCompleted={completedArticles.includes(selectedArticle.id)}
        onComplete={() => markAsComplete(selectedArticle.id)}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50/50 via-beige-50 to-soft-blue-50/30 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-sage-600 via-sage-500 to-emerald-500 px-4 py-6 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Learn</span>
          </div>
          <h1 className="text-xl font-bold mb-1">Educational Content</h1>
          <p className="text-white/80 text-sm">Expand your mental wellness knowledge</p>

          {/* Progress */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{completedArticles.length}/{articles.length} completed</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              !selectedCategory
                ? "bg-sage-600 text-white"
                : "bg-beige-100 text-sage-600 hover:bg-beige-200"
            )}
          >
            All Topics
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                selectedCategory === cat.id
                  ? "bg-sage-600 text-white"
                  : "bg-beige-100 text-sage-600 hover:bg-beige-200"
              )}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {!selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-sage-500 to-emerald-500 text-white overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium opacity-80">Featured</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{articles[0].title}</h3>
                <p className="text-white/80 text-sm mb-3">{articles[0].description}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedArticle(articles[0])}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Reading
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Articles Grid */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sage-800">
            {selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.name
              : "All Articles"}
          </h3>
          {filteredArticles.map((article, index) => {
            const category = categories.find(c => c.id === article.category);
            const isCompleted = completedArticles.includes(article.id);

            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all",
                    isCompleted && "bg-sage-50/50"
                  )}
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", category?.color)}>
                        {category?.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sage-800">{article.title}</h4>
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-sage-500" />
                          )}
                        </div>
                        <p className="text-sm text-sage-500 mt-0.5">{article.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-sage-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min read
                          </span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", category?.color)}>
                            {category?.name}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-sage-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ArticleViewProps {
  article: Article;
  isCompleted: boolean;
  onComplete: () => void;
  onBack: () => void;
}

function ArticleView({ article, isCompleted, onComplete, onBack }: ArticleViewProps) {
  const category = categories.find(c => c.id === article.category);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50/50 via-beige-50 to-soft-blue-50/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-beige-200">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-beige-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-sage-600" />
          </button>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-beige-100 rounded-lg">
              <BookmarkPlus className="w-5 h-5 text-sage-400" />
            </button>
            <button className="p-2 hover:bg-beige-100 rounded-lg">
              <Share2 className="w-5 h-5 text-sage-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Article Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm mb-3", category?.color)}>
            <span>{category?.icon}</span>
            {category?.name}
          </div>
          <h1 className="text-2xl font-bold text-sage-800 mb-2">{article.title}</h1>
          <p className="text-sage-600">{article.description}</p>
          <div className="flex items-center gap-3 mt-3 text-sm text-sage-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime} min read
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-sage-600">
                <CheckCircle className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {article.content.map((paragraph, index) => (
            <p key={index} className="text-sage-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* Exercises */}
        {article.exercises && article.exercises.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-sage-50 border-sage-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="w-5 h-5 text-sage-600" />
                  Try This Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {article.exercises.map((exercise, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-sage-800 mb-2">{exercise.title}</h4>
                    <ol className="space-y-2">
                      {exercise.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2 text-sage-700">
                          <span className="w-6 h-6 bg-sage-200 rounded-full flex items-center justify-center text-sm font-medium text-sage-700 flex-shrink-0">
                            {stepIndex + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tips */}
        {article.tips && article.tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {article.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sage-700">
                      <span className="text-sage-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Complete Button */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button onClick={onComplete} className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
