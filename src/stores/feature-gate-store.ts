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
    // Always unlock everything immediately - no 10 chat requirement
    
    // Demo mode - create local feature gate with everything unlocked
    if (isDemoMode()) {
      set({
        featureGate: {
          id: "demo-gate",
          userId,
          completedChats: UNLOCK_THRESHOLD, // Set to threshold so everything is unlocked
          unlockedAt: new Date(), // Already unlocked
          createdAt: new Date(),
        },
        unlockedFeatures: ["pet_selection", "dashboard", "peer_community", "full_profile"],
        isLoading: false,
        completedChats: UNLOCK_THRESHOLD,
        todayChats: UNLOCK_THRESHOLD,
        isFullyUnlocked: true, // Everything unlocked immediately
        hasCompletedTodayRequirement: true,
        canAccessPetSelection: true,
        canAccessDashboard: true,
        canAccessCommunity: true,
      });
      return;
    }

    const supabase = createClient();
    
    // Don't block - set loading false immediately and unlock everything
    set({ 
      isLoading: false,
      isFullyUnlocked: true, // Unlock everything immediately
      canAccessPetSelection: true,
      canAccessDashboard: true,
      canAccessCommunity: true,
    });
    
    try {
      // Get or create feature gate with everything unlocked
      let gate = null;
      const { data: existingGate, error } = await supabase
        .from("feature_gates")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code === "PGRST116") {
        // Create new feature gate with everything unlocked
        const { data: newGate, error: createError } = await supabase
          .from("feature_gates")
          .insert({
            user_id: userId,
            completed_chats: UNLOCK_THRESHOLD, // Set to threshold
            unlocked_at: new Date().toISOString(), // Already unlocked
          })
          .select()
          .single();
        
        if (createError) throw createError;
        gate = newGate;
      } else if (error) {
        throw error;
      } else {
        gate = existingGate;
      }
      
      // Get or create unlocked features - all features unlocked
      const allFeatures: UnlockedFeature[] = ["pet_selection", "dashboard", "peer_community", "full_profile"];
      
      // Ensure all features are in database
      for (const feature of allFeatures) {
        await supabase
          .from("unlocked_features")
          .upsert({
            user_id: userId,
            feature,
            unlocked_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,feature'
          });
      }
      
      set({
        featureGate: gate ? {
          id: gate.id,
          userId: gate.user_id,
          completedChats: UNLOCK_THRESHOLD,
          unlockedAt: new Date(),
          createdAt: new Date(gate.created_at),
        } : null,
        unlockedFeatures: allFeatures,
        completedChats: UNLOCK_THRESHOLD,
        isFullyUnlocked: true,
        canAccessPetSelection: true,
        canAccessDashboard: true,
        canAccessCommunity: true,
      });
      
    } catch {
      // Silently handle - feature gates table may not exist yet
      // Everything stays unlocked, so this is non-critical
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
      } catch {
        // Silently handle - database may not be configured
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
