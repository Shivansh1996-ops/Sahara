/**
 * Community Learning Engine
 * Enables users to learn together through study circles, learning groups, and collaborative challenges
 * Integrates with Supabase for persistent data storage
 */

import { createClient } from "@/lib/supabase/client";

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
 * Get learning groups from Supabase
 */
export async function getLearningGroups(): Promise<LearningGroup[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("learning_groups")
      .select(`
        id,
        name,
        description,
        topic,
        icon,
        level,
        color,
        created_at,
        learning_group_members(count)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((group: any) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      topic: group.topic,
      icon: group.icon,
      level: group.level,
      color: group.color,
      members: group.learning_group_members?.[0]?.count || 0,
      createdAt: new Date(group.created_at),
    }));
  } catch (error) {
    console.error("Error fetching learning groups:", error);
    return demoLearningGroups;
  }
}

/**
 * Get study circles from Supabase
 */
export async function getStudyCircles(groupId?: string): Promise<StudyCircle[]> {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from("study_circles")
      .select(`
        id,
        group_id,
        title,
        description,
        scheduled_at,
        duration,
        facilitator_name,
        max_participants,
        topic,
        status,
        study_circle_participants(count)
      `)
      .order("scheduled_at", { ascending: true });

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((circle: any) => ({
      id: circle.id,
      groupId: circle.group_id,
      title: circle.title,
      description: circle.description,
      scheduledAt: new Date(circle.scheduled_at),
      duration: circle.duration,
      facilitator: circle.facilitator_name,
      maxParticipants: circle.max_participants,
      currentParticipants: circle.study_circle_participants?.[0]?.count || 0,
      topic: circle.topic,
      resources: [],
      status: circle.status,
    }));
  } catch (error) {
    console.error("Error fetching study circles:", error);
    return demoStudyCircles;
  }
}

/**
 * Get shared resources from Supabase
 */
export async function getSharedResources(groupId?: string): Promise<SharedResource[]> {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from("shared_resources")
      .select(`
        id,
        group_id,
        title,
        description,
        type,
        shared_by_name,
        likes_count,
        comments_count,
        created_at,
        resource_tags(tag)
      `)
      .order("created_at", { ascending: false });

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((resource: any) => ({
      id: resource.id,
      groupId: resource.group_id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      sharedBy: resource.shared_by_name,
      createdAt: new Date(resource.created_at),
      likes: resource.likes_count,
      comments: resource.comments_count,
      tags: resource.resource_tags?.map((t: any) => t.tag) || [],
    }));
  } catch (error) {
    console.error("Error fetching shared resources:", error);
    return demoSharedResources;
  }
}

/**
 * Get learning challenges from Supabase
 */
export async function getLearningChallenges(): Promise<LearningChallenge[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("learning_challenges")
      .select(`
        id,
        title,
        description,
        topic,
        difficulty,
        duration,
        icon,
        start_date,
        end_date,
        challenge_participants(count),
        challenge_rewards(reward_text, points)
      `)
      .order("start_date", { ascending: false });

    if (error) throw error;

    return (data || []).map((challenge: any) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      topic: challenge.topic,
      difficulty: challenge.difficulty,
      duration: challenge.duration,
      icon: challenge.icon,
      startDate: new Date(challenge.start_date),
      endDate: new Date(challenge.end_date),
      participants: challenge.challenge_participants?.[0]?.count || 0,
      progress: Math.floor(Math.random() * 100),
      rewards: challenge.challenge_rewards?.map((r: any) => `${r.reward_text} (${r.points} points)`) || [],
    }));
  } catch (error) {
    console.error("Error fetching learning challenges:", error);
    return demoLearningChallenges;
  }
}

/**
 * Get discussion threads from Supabase
 */
export async function getDiscussionThreads(groupId?: string): Promise<DiscussionThread[]> {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from("discussion_threads")
      .select(`
        id,
        group_id,
        title,
        description,
        author_name,
        replies_count,
        views_count,
        is_pinned,
        created_at,
        last_activity_at,
        discussion_tags(tag)
      `)
      .order("is_pinned", { ascending: false })
      .order("last_activity_at", { ascending: false });

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((thread: any) => ({
      id: thread.id,
      groupId: thread.group_id,
      title: thread.title,
      description: thread.description,
      author: thread.author_name,
      createdAt: new Date(thread.created_at),
      replies: thread.replies_count,
      views: thread.views_count,
      isPinned: thread.is_pinned,
      tags: thread.discussion_tags?.map((t: any) => t.tag) || [],
      lastActivityAt: new Date(thread.last_activity_at),
    }));
  } catch (error) {
    console.error("Error fetching discussion threads:", error);
    return demoDiscussionThreads;
  }
}

/**
 * Get user milestones from Supabase
 */
export async function getUserMilestones(userId: string): Promise<LearningMilestone[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from("learning_milestones")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((milestone: any) => ({
      id: milestone.id,
      userId: milestone.user_id,
      groupId: milestone.group_id,
      title: milestone.title,
      description: milestone.description,
      completedAt: new Date(milestone.completed_at),
      badge: milestone.badge,
      points: milestone.points,
    }));
  } catch (error) {
    console.error("Error fetching user milestones:", error);
    return demoMilestones;
  }
}

/**
 * Join a learning group
 */
export async function joinLearningGroup(userId: string, groupId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("learning_group_members")
      .insert({ user_id: userId, group_id: groupId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error joining learning group:", error);
    return false;
  }
}

/**
 * Leave a learning group
 */
export async function leaveLearningGroup(userId: string, groupId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("learning_group_members")
      .delete()
      .eq("user_id", userId)
      .eq("group_id", groupId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error leaving learning group:", error);
    return false;
  }
}

/**
 * Join a study circle
 */
export async function joinStudyCircle(userId: string, circleId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("study_circle_participants")
      .insert({ user_id: userId, circle_id: circleId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error joining study circle:", error);
    return false;
  }
}

/**
 * Leave a study circle
 */
export async function leaveStudyCircle(userId: string, circleId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("study_circle_participants")
      .delete()
      .eq("user_id", userId)
      .eq("circle_id", circleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error leaving study circle:", error);
    return false;
  }
}

/**
 * Like a shared resource
 */
export async function likeResource(userId: string, resourceId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("resource_likes")
      .insert({ user_id: userId, resource_id: resourceId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error liking resource:", error);
    return false;
  }
}

/**
 * Unlike a shared resource
 */
export async function unlikeResource(userId: string, resourceId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("resource_likes")
      .delete()
      .eq("user_id", userId)
      .eq("resource_id", resourceId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unliking resource:", error);
    return false;
  }
}

/**
 * Comment on a shared resource
 */
export async function commentOnResource(userId: string, resourceId: string, content: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("resource_comments")
      .insert({ user_id: userId, resource_id: resourceId, content });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error commenting on resource:", error);
    return false;
  }
}

/**
 * Reply to a discussion thread
 */
export async function replyToThread(userId: string, threadId: string, content: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("discussion_replies")
      .insert({ user_id: userId, thread_id: threadId, content });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error replying to thread:", error);
    return false;
  }
}

/**
 * Join a learning challenge
 */
export async function joinChallenge(userId: string, challengeId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("challenge_participants")
      .insert({ user_id: userId, challenge_id: challengeId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error joining challenge:", error);
    return false;
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from("challenge_participants")
      .update({ progress_percentage: progress })
      .eq("user_id", userId)
      .eq("challenge_id", challengeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating challenge progress:", error);
    return false;
  }
}
