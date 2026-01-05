import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAnonymousName(): string {
  const adjectives = [
    "Gentle", "Calm", "Peaceful", "Serene", "Quiet",
    "Warm", "Kind", "Soft", "Bright", "Hopeful",
    "Brave", "Strong", "Wise", "Patient", "Caring",
    "Mindful", "Grateful", "Joyful", "Tender", "Radiant"
  ];
  
  const nouns = [
    "Leaf", "Cloud", "River", "Mountain", "Meadow",
    "Breeze", "Star", "Moon", "Sun", "Garden",
    "Forest", "Ocean", "Pebble", "Flower", "Tree",
    "Bird", "Butterfly", "Rainbow", "Dawn", "Dusk"
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = today;
  
  for (const date of sortedDates) {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - checkDate.getTime()) / 86400000);
    
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = checkDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export const SUPPORTIVE_EMOJIS = ["💚", "🌱", "✨", "🤗", "💪"] as const;
export type SupportiveEmoji = typeof SUPPORTIVE_EMOJIS[number];

export function isValidSupportiveEmoji(emoji: string): emoji is SupportiveEmoji {
  return SUPPORTIVE_EMOJIS.includes(emoji as SupportiveEmoji);
}

export const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "want to die",
  "self-harm", "hurt myself", "cutting", "overdose",
  "no reason to live", "better off dead", "can't go on"
];

export function detectCrisisKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

export const HELPLINE_RESOURCES = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    url: "https://988lifeline.org",
    country: "US"
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    url: "https://www.crisistextline.org",
    country: "US"
  },
  {
    name: "International Association for Suicide Prevention",
    phone: "Various",
    url: "https://www.iasp.info/resources/Crisis_Centres/",
    country: "International"
  }
];
