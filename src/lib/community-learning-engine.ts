/**
 * Community Learning Engine
 * Enables users to learn together through study circles, learning groups, and collaborative challenges
 */

export interface LearningGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  icon: string;
  members: number;
  level: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  nextSession?: Date;
  color: string;
}

export interface StudyCircle {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number; // in minutes
  facilitator: string;
  maxParticipants: number;
  currentParticipants: number;
  topic: string;
  resources: string[];
  status: "upcoming" | "ongoing" | "completed";
}

export interface SharedResource {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: "article" | "video" | "exercise" | "guide" | "discussion";
  url?: string;
  content?: string;
  sharedBy: string;
  createdAt: Date;
  likes: number;
  comments: number;
  tags: string[];
}

export interface LearningChallenge {
  id: string;
  title: string;
  description: string;
  topic: string;
  duration: number; // in days
  participants: number;
  progress: number; // percentage
  difficulty: "easy" | "medium" | "hard";
  rewards: string[];
  startDate: Date;
  endDate: Date;
  icon: string;
}

export interface DiscussionThread {
  id: string;
  groupId: string;
  title: string;
  description: string;
  author: string;
  createdAt: Date;
  replies: number;
  views: number;
  isPinned: boolean;
  tags: string[];
  lastActivityAt: Date;
}

export interface LearningMilestone {
  id: string;
  userId: string;
  groupId: string;
  title: string;
  description: string;
  completedAt: Date;
  badge: string;
  points: number;
}

// Demo learning groups
export const demoLearningGroups: LearningGroup[] = [
  {
    id: "cbt-basics",
    name: "CBT Fundamentals",
    description: "Learn the basics of Cognitive Behavioral Therapy together",
    topic: "Mental Health",
    icon: "🧠",
    members: 342,
    level: "beginner",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "mindfulness-journey",
    name: "Mindfulness Journey",
    description: "Explore mindfulness practices and meditation techniques",
    topic: "Wellness",
    icon: "🧘",
    members: 567,
    level: "beginner",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    nextSession: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "stress-management",
    name: "Stress Management Mastery",
    description: "Advanced techniques for managing stress and building resilience",
    topic: "Wellness",
    icon: "🌊",
    members: 289,
    level: "intermediate",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    nextSession: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    color: "bg-teal-100 text-teal-600",
  },
  {
    id: "sleep-science",
    name: "Sleep Science & Better Rest",
    description: "Understand sleep cycles and improve your sleep quality",
    topic: "Health",
    icon: "🌙",
    members: 198,
    level: "beginner",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    nextSession: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "emotional-intelligence",
    name: "Emotional Intelligence",
    description: "Develop emotional awareness and interpersonal skills",
    topic: "Personal Growth",
    icon: "💚",
    members: 421,
    level: "intermediate",
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
    nextSession: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "resilience-building",
    name: "Building Resilience",
    description: "Learn strategies to bounce back from challenges",
    topic: "Mental Health",
    icon: "💪",
    members: 334,
    level: "advanced",
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    nextSession: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    color: "bg-amber-100 text-amber-600",
  },
];

// Demo study circles
export const demoStudyCircles: StudyCircle[] = [
  {
    id: "circle-1",
    groupId: "cbt-basics",
    title: "Introduction to Cognitive Distortions",
    description: "Learn to identify and challenge negative thought patterns",
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    duration: 60,
    facilitator: "Dr. Sarah",
    maxParticipants: 30,
    currentParticipants: 24,
    topic: "Cognitive Distortions",
    resources: ["article-1", "worksheet-1", "video-1"],
    status: "upcoming",
  },
  {
    id: "circle-2",
    groupId: "mindfulness-journey",
    title: "Guided Meditation Practice",
    description: "Join us for a 30-minute guided meditation session",
    scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: 30,
    facilitator: "Alex",
    maxParticipants: 50,
    currentParticipants: 38,
    topic: "Meditation",
    resources: ["audio-1", "guide-1"],
    status: "upcoming",
  },
  {
    id: "circle-3",
    groupId: "stress-management",
    title: "Progressive Muscle Relaxation Workshop",
    description: "Learn and practice PMR techniques for stress relief",
    scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    duration: 45,
    facilitator: "Jordan",
    maxParticipants: 25,
    currentParticipants: 22,
    topic: "Relaxation Techniques",
    resources: ["video-2", "worksheet-2"],
    status: "completed",
  },
];

// Demo shared resources
export const demoSharedResources: SharedResource[] = [
  {
    id: "res-1",
    groupId: "cbt-basics",
    title: "Understanding Automatic Thoughts",
    description: "A comprehensive guide to identifying your automatic negative thoughts",
    type: "article",
    sharedBy: "Emma",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    likes: 45,
    comments: 12,
    tags: ["cbt", "thoughts", "beginner"],
  },
  {
    id: "res-2",
    groupId: "mindfulness-journey",
    title: "5-Minute Breathing Exercise",
    description: "Quick breathing technique for instant calm",
    type: "exercise",
    sharedBy: "Marcus",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    likes: 78,
    comments: 23,
    tags: ["breathing", "quick", "beginner"],
  },
  {
    id: "res-3",
    groupId: "stress-management",
    title: "Stress Management Toolkit",
    description: "Collection of practical tools and techniques",
    type: "guide",
    sharedBy: "Dr. Lisa",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    likes: 92,
    comments: 34,
    tags: ["stress", "toolkit", "comprehensive"],
  },
];

// Demo learning challenges
export const demoLearningChallenges: LearningChallenge[] = [
  {
    id: "challenge-1",
    title: "7-Day Mindfulness Challenge",
    description: "Practice mindfulness for 7 consecutive days",
    topic: "Mindfulness",
    duration: 7,
    participants: 456,
    progress: 65,
    difficulty: "easy",
    rewards: ["🏅 Mindfulness Badge", "50 points"],
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    icon: "🧘",
  },
  {
    id: "challenge-2",
    title: "CBT Thought Record Challenge",
    description: "Complete 10 thought records using CBT techniques",
    topic: "CBT",
    duration: 14,
    participants: 234,
    progress: 42,
    difficulty: "medium",
    rewards: ["🎯 CBT Master Badge", "75 points"],
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    icon: "🧠",
  },
  {
    id: "challenge-3",
    title: "Stress Resilience Sprint",
    description: "Build resilience through daily stress management practices",
    topic: "Stress Management",
    duration: 21,
    participants: 189,
    progress: 28,
    difficulty: "hard",
    rewards: ["🏆 Resilience Champion Badge", "100 points"],
    startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    icon: "💪",
  },
];

// Demo discussion threads
export const demoDiscussionThreads: DiscussionThread[] = [
  {
    id: "thread-1",
    groupId: "cbt-basics",
    title: "How do you identify your cognitive distortions?",
    description: "Share your experience with recognizing negative thought patterns",
    author: "Sarah",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    replies: 18,
    views: 156,
    isPinned: true,
    tags: ["distortions", "techniques", "discussion"],
    lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "thread-2",
    groupId: "mindfulness-journey",
    title: "Best time of day for meditation?",
    description: "When do you find meditation most effective?",
    author: "James",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    replies: 34,
    views: 289,
    isPinned: false,
    tags: ["meditation", "timing", "tips"],
    lastActivityAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "thread-3",
    groupId: "stress-management",
    title: "Combining multiple stress management techniques",
    description: "What's your favorite combination of techniques?",
    author: "Dr. Lisa",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    replies: 42,
    views: 412,
    isPinned: true,
    tags: ["techniques", "combination", "advanced"],
    lastActivityAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

// Learning milestones
export const demoMilestones: LearningMilestone[] = [
  {
    id: "milestone-1",
    userId: "user-1",
    groupId: "cbt-basics",
    title: "First Thought Record",
    description: "Completed your first CBT thought record",
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    badge: "📝",
    points: 10,
  },
  {
    id: "milestone-2",
    userId: "user-1",
    groupId: "mindfulness-journey",
    title: "7-Day Streak",
    description: "Meditated for 7 consecutive days",
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    badge: "🔥",
    points: 25,
  },
];

/**
 * Get learning groups for a user
 */
export function getLearningGroups(): LearningGroup[] {
  return demoLearningGroups;
}

/**
 * Get study circles for a group
 */
export function getStudyCircles(groupId?: string): StudyCircle[] {
  if (groupId) {
    return demoStudyCircles.filter((circle) => circle.groupId === groupId);
  }
  return demoStudyCircles;
}

/**
 * Get shared resources for a group
 */
export function getSharedResources(groupId?: string): SharedResource[] {
  if (groupId) {
    return demoSharedResources.filter((res) => res.groupId === groupId);
  }
  return demoSharedResources;
}

/**
 * Get learning challenges
 */
export function getLearningChallenges(): LearningChallenge[] {
  return demoLearningChallenges;
}

/**
 * Get discussion threads for a group
 */
export function getDiscussionThreads(groupId?: string): DiscussionThread[] {
  if (groupId) {
    return demoDiscussionThreads.filter((thread) => thread.groupId === groupId);
  }
  return demoDiscussionThreads;
}

/**
 * Get user milestones
 */
export function getUserMilestones(userId: string): LearningMilestone[] {
  return demoMilestones.filter((m) => m.userId === userId);
}

/**
 * Calculate group statistics
 */
export function getGroupStats(groupId: string) {
  const group = demoLearningGroups.find((g) => g.id === groupId);
  const circles = getStudyCircles(groupId);
  const resources = getSharedResources(groupId);
  const threads = getDiscussionThreads(groupId);

  return {
    group,
    totalSessions: circles.length,
    completedSessions: circles.filter((c) => c.status === "completed").length,
    totalResources: resources.length,
    totalDiscussions: threads.length,
    totalEngagement: resources.reduce((sum, r) => sum + r.likes + r.comments, 0),
  };
}
