import { create } from "zustand";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import type { FeatureGate, UnlockedFeature } from "@/types";

interface FeatureGateState {
  featureGate: FeatureGate | null;
  unlockedFeatures: UnlockedFeature[];
  isLoading: boolean;
  showUnlockTransition: boolean;
  
  // Computed values stored as state
  completedChats: number;
  todayChats: number;
  isFullyUnlocked: boolean;
  hasCompletedTodayRequirement: boolean;
  canAccessPetSelection: boolean;
  canAccessDashboard: boolean;
  canAccessCommunity: boolean;
  
  // Actions
  fetchFeatureGate: (userId: string) => Promise<void>;
  checkAndUnlock: (userId: string) => Promise<boolean>;
  dismissUnlockTransition: () => void;
  incrementDemoChats: () => void;
  checkDailyRequirement: () => boolean;
}

const UNLOCK_THRESHOLD = 10;
const DAILY_CHAT_KEY = "sahara-daily-chats";
const UNLOCK_DATE_KEY = "sahara-unlock-date";

// Helper to get today's date string
const getTodayString = () => new Date().toISOString().split('T')[0];

// Helper to check if user has completed daily requirement
const getDailyProgress = () => {
  if (typeof window === 'undefined') return { todayChats: 0, hasCompletedToday: false, isUnlocked: false };
  
  const stored = localStorage.getItem(DAILY_CHAT_KEY);
  const unlockDate = localStorage.getItem(UNLOCK_DATE_KEY);
  const today = getTodayString();
  
  // If already unlocked, check if it was today
  if (unlockDate) {
    const isUnlockedToday = unlockDate === today;
    return { todayChats: 10, hasCompletedToday: true, isUnlocked: isUnlockedToday };
  }
  
  if (!stored) return { todayChats: 0, hasCompletedToday: false, isUnlocked: false };
  
  try {
    const data = JSON.parse(stored);
    if (data.date === today) {
      const hasCompleted = data.count >= UNLOCK_THRESHOLD;
      if (hasCompleted && !unlockDate) {
        localStorage.setItem(UNLOCK_DATE_KEY, today);
      }
      return { todayChats: data.count, hasCompletedToday: hasCompleted, isUnlocked: hasCompleted };
    }
    // New day - reset count
    return { todayChats: 0, hasCompletedToday: false, isUnlocked: false };
  } catch {
    return { todayChats: 0, hasCompletedToday: false, isUnlocked: false };
  }
};

// Helper to save daily progress
const saveDailyProgress = (count: number) => {
  if (typeof window === 'undefined') return;
  const today = getTodayString();
  localStorage.setItem(DAILY_CHAT_KEY, JSON.stringify({ date: today, count }));
  if (count >= UNLOCK_THRESHOLD) {
    localStorage.setItem(UNLOCK_DATE_KEY, today);
  }
};

export const useFeatureGateStore = create<FeatureGateState>((set, get) => ({
  featureGate: null,
  unlockedFeatures: [],
  isLoading: true,
  showUnlockTransition: false,
  
  // Initialize computed values
  completedChats: 0,
  todayChats: 0,
  isFullyUnlocked: false,
  hasCompletedTodayRequirement: false,
  canAccessPetSelection: false,
  canAccessDashboard: false,
  canAccessCommunity: false,

  checkDailyRequirement: () => {
    const { hasCompletedToday, isUnlocked } = getDailyProgress();
    return hasCompletedToday || isUnlocked;
  },

  fetchFeatureGate: async (userId: string) => {
    // Check daily progress from localStorage
    const { todayChats, hasCompletedToday, isUnlocked } = getDailyProgress();
    
    // Demo mode - create local feature gate
    if (isDemoMode()) {
      set({
        featureGate: {
          id: "demo-gate",
          userId,
          completedChats: todayChats,
          unlockedAt: isUnlocked ? new Date() : null,
          createdAt: new Date(),
        },
        unlockedFeatures: [],
        isLoading: false,
        completedChats: todayChats,
        todayChats,
        isFullyUnlocked: isUnlocked,
        hasCompletedTodayRequirement: hasCompletedToday,
        canAccessPetSelection: isUnlocked,
        canAccessDashboard: isUnlocked,
        canAccessCommunity: isUnlocked,
      });
      return;
    }

    const supabase = createClient();
    
    set({ isLoading: true });
    
    try {
      // Get or create feature gate
      let { data: gate, error } = await supabase
        .from("feature_gates")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code === "PGRST116") {
        // Create new feature gate
        const { data: newGate, error: createError } = await supabase
          .from("feature_gates")
          .insert({
            user_id: userId,
            completed_chats: 0,
          })
          .select()
          .single();
        
        if (createError) throw createError;
        gate = newGate;
      } else if (error) {
        throw error;
      }
      
      // Get unlocked features
      const { data: features } = await supabase
        .from("unlocked_features")
        .select("feature")
        .eq("user_id", userId);
      
      const unlockedFeatures = (features || []).map((f) => f.feature as UnlockedFeature);
      const chats = gate?.completed_chats ?? 0;
      const fullyUnlocked = chats >= UNLOCK_THRESHOLD;
      
      set({
        featureGate: gate ? {
          id: gate.id,
          userId: gate.user_id,
          completedChats: gate.completed_chats,
          unlockedAt: gate.unlocked_at ? new Date(gate.unlocked_at) : null,
          createdAt: new Date(gate.created_at),
        } : null,
        unlockedFeatures,
        completedChats: chats,
        isFullyUnlocked: fullyUnlocked,
        canAccessPetSelection: unlockedFeatures.includes("pet_selection") || fullyUnlocked,
        canAccessDashboard: unlockedFeatures.includes("dashboard") || fullyUnlocked,
        canAccessCommunity: unlockedFeatures.includes("peer_community") || fullyUnlocked,
      });
      
    } catch (error) {
      console.error("Error fetching feature gate:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  checkAndUnlock: async (userId: string) => {
    const { featureGate, unlockedFeatures, completedChats } = get();
    
    if (!featureGate) return false;
    
    // Demo mode - handle locally
    if (isDemoMode()) {
      if (completedChats >= UNLOCK_THRESHOLD && !featureGate.unlockedAt) {
        const featuresToUnlock: UnlockedFeature[] = [
          "pet_selection",
          "dashboard",
          "peer_community",
          "full_profile",
        ];
        
        set({
          showUnlockTransition: true,
          unlockedFeatures: featuresToUnlock,
          isFullyUnlocked: true,
          canAccessPetSelection: true,
          canAccessDashboard: true,
          canAccessCommunity: true,
          featureGate: {
            ...featureGate,
            unlockedAt: new Date(),
          },
        });
        
        return true;
      }
      return false;
    }

    const supabase = createClient();
    
    // Check if we've hit the threshold and haven't unlocked yet
    if (completedChats >= UNLOCK_THRESHOLD && !featureGate.unlockedAt) {
      try {
        // Update feature gate
        await supabase
          .from("feature_gates")
          .update({ unlocked_at: new Date().toISOString() })
          .eq("id", featureGate.id);
        
        // Unlock features sequentially
        const featuresToUnlock: UnlockedFeature[] = [
          "pet_selection",
          "dashboard",
          "peer_community",
          "full_profile",
        ];
        
        for (const feature of featuresToUnlock) {
          if (!unlockedFeatures.includes(feature)) {
            await supabase
              .from("unlocked_features")
              .insert({
                user_id: userId,
                feature,
                unlocked_at: new Date().toISOString(),
              });
          }
        }
        
        set({
          showUnlockTransition: true,
          unlockedFeatures: featuresToUnlock,
          isFullyUnlocked: true,
          canAccessPetSelection: true,
          canAccessDashboard: true,
          canAccessCommunity: true,
          featureGate: {
            ...featureGate,
            unlockedAt: new Date(),
          },
        });
        
        return true;
      } catch (error) {
        console.error("Error unlocking features:", error);
      }
    }
    
    return false;
  },

  incrementDemoChats: () => {
    const { featureGate, completedChats } = get();
    if (featureGate && isDemoMode()) {
      const newCount = completedChats + 1;
      const fullyUnlocked = newCount >= UNLOCK_THRESHOLD;
      
      // Save to localStorage for daily tracking
      saveDailyProgress(newCount);
      
      set({
        featureGate: {
          ...featureGate,
          completedChats: newCount,
        },
        completedChats: newCount,
        todayChats: newCount,
        isFullyUnlocked: fullyUnlocked,
        hasCompletedTodayRequirement: fullyUnlocked,
        canAccessPetSelection: fullyUnlocked,
        canAccessDashboard: fullyUnlocked,
        canAccessCommunity: fullyUnlocked,
      });
    }
  },

  dismissUnlockTransition: () => {
    set({ showUnlockTransition: false });
  },
}));
