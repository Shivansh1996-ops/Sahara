// User Types
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string | null;
  sex: string | null;
  age: number | null;
  medicalHistoryEncrypted: string | null;
  anonymousName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Feature Gate Types
export interface FeatureGate {
  id: string;
  userId: string;
  completedChats: number;
  unlockedAt: Date | null;
  createdAt: Date;
}

export type UnlockedFeature = 
  | "pet_selection"
  | "dashboard"
  | "peer_community"
  | "full_profile";

export interface UnlockedFeatureRecord {
  id: string;
  userId: string;
  feature: UnlockedFeature;
  unlockedAt: Date;
}

// Pet Types
export type PetPersonality = "calm" | "playful" | "grounding" | "motivating";

export interface Pet {
  id: string;
  name: string;
  personality: PetPersonality;
  imageUrl: string;
  animationConfig: PetAnimations;
  aiToneModifier: string;
  isDefault: boolean;
}

export interface PetAnimations {
  idle: string;
  blink: string;
  breathe: string;
  glow: string;
  happy: string;
  thinking: string;
}

export type PetAnimationState = keyof PetAnimations;

export interface UserPet {
  id: string;
  userId: string;
  petId: string;
  bondLevel: number;
  selectedAt: Date;
  isActive: boolean;
  pet?: Pet;
}

// Chat Types
export interface ChatSession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  messageCount: number;
  isCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  role: "user" | "assistant";
  emotionalKeywords: string[] | null;
  createdAt: Date;
}

// Mood Types
export interface MoodEntry {
  id: string;
  userId: string;
  sessionId: string | null;
  moodScore: number;
  dominantEmotion: string | null;
  recordedAt: Date;
}

export interface MoodTrend {
  date: Date;
  moodScore: number;
  dominantEmotion: string | null;
}

// Community Types
export interface CommunityPost {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
  author?: {
    anonymousName: string;
  };
  reactions?: PostReaction[];
  _count?: {
    reactions: number;
  };
}

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  emoji: SupportiveEmoji;
  createdAt: Date;
}

export type SupportiveEmoji = "💚" | "🌱" | "✨" | "🤗" | "💪";

export interface PeerConnection {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: Date;
}

export interface PeerNode {
  id: string;
  anonymousName: string;
  avatarSeed: string;
  connectionCount: number;
}

// Dashboard Types
export interface DashboardData {
  moodTrends: MoodTrend[];
  chatStreak: number;
  petBondLevel: number;
  emotionalKeywords: { word: string; count: number }[];
  totalSessions: number;
  affirmation: string;
}

// AI Types
export interface AIResponse {
  content: string;
  suggestedAnimation: PetAnimationState;
  isCrisisDetected: boolean;
}

export interface CrisisDetection {
  isDetected: boolean;
  severity: "low" | "medium" | "high";
  resources: HelplineResource[];
}

export interface HelplineResource {
  name: string;
  phone: string;
  url: string;
  country: string;
}

// Affirmation Type
export interface Affirmation {
  id: string;
  content: string;
  category: string | null;
}
