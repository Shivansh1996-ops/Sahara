import { create } from "zustand";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { localSignIn, localSignUp, localSignOut, getSession, type LocalUser } from "@/lib/local-auth";
import type { User, UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isEmailVerified: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  enableDemoMode: () => void;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
}

// Helper to convert LocalUser to User
function localUserToUser(localUser: LocalUser): User {
  return {
    id: localUser.id,
    email: localUser.email,
    createdAt: new Date(localUser.createdAt),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isDemoMode: isDemoMode(),
  isEmailVerified: true, // Local auth doesn't need email verification

  initialize: async () => {
    const { isDemoMode: isDemo, isAuthenticated } = get();
    
    if (isDemo && isAuthenticated) {
      set({ isLoading: false });
      return;
    }
    
    // Check for existing local session first
    const localSession = getSession();
    if (localSession) {
      // Try to load saved profile from localStorage
      let savedProfile: UserProfile | null = null;
      if (typeof window !== 'undefined') {
        const profileKey = `sahara-profile-${localSession.id}`;
        const savedProfileJson = localStorage.getItem(profileKey);
        if (savedProfileJson) {
          try {
            const parsed = JSON.parse(savedProfileJson);
            savedProfile = {
              ...parsed,
              createdAt: new Date(parsed.createdAt),
              updatedAt: new Date(parsed.updatedAt),
            };
          } catch (e) {
            console.error('Error parsing saved profile:', e);
          }
        }
      }
      
      set({
        user: localUserToUser(localSession),
        profile: savedProfile || {
          id: localSession.id,
          userId: localSession.id,
          name: localSession.name,
          sex: null,
          age: null,
          medicalHistoryEncrypted: null,
          anonymousName: `User${localSession.id.slice(0, 4)}`,
          createdAt: new Date(localSession.createdAt),
          updatedAt: new Date(localSession.createdAt),
        },
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified: true,
      });
      return;
    }
    
    // If Supabase is in demo mode, just show landing page
    if (isDemoMode()) {
      set({ isLoading: false, isDemoMode: true });
      return;
    }

    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email!,
            createdAt: new Date(user.created_at),
          },
          isAuthenticated: true,
          isLoading: false,
        });
        
        await get().fetchProfile();
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ isLoading: false });
    }

    if (!isDemoMode()) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              createdAt: new Date(session.user.created_at),
            },
            isAuthenticated: true,
          });
          await get().fetchProfile();
        } else if (event === "SIGNED_OUT") {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          });
        }
      });
    }
  },

  signInWithGoogle: async () => {
    if (isDemoMode()) {
      throw new Error("Google sign-in not available in demo mode. Please use email sign-in.");
    }
    
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
  },

  signInWithEmail: async (email: string, password: string) => {
    // Always try local auth first (works without Supabase)
    try {
      const { user: localUser } = await localSignIn(email, password);
      
      set({
        user: localUserToUser(localUser),
        profile: {
          id: localUser.id,
          userId: localUser.id,
          name: localUser.name,
          sex: null,
          age: null,
          medicalHistoryEncrypted: null,
          anonymousName: `User${localUser.id.slice(0, 4)}`,
          createdAt: new Date(localUser.createdAt),
          updatedAt: new Date(localUser.createdAt),
        },
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified: true,
      });
      return;
    } catch (localError) {
      // If local auth fails with "no account", try Supabase if configured
      if (!isDemoMode() && (localError as Error).message.includes("No account found")) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return;
      }
      throw localError;
    }
  },

  signUpWithEmail: async (email: string, password: string, name?: string) => {
    // Use local auth for sign up (works without Supabase)
    try {
      const { user: localUser } = await localSignUp(email, password, name);
      
      set({
        user: localUserToUser(localUser),
        profile: {
          id: localUser.id,
          userId: localUser.id,
          name: localUser.name,
          sex: null,
          age: null,
          medicalHistoryEncrypted: null,
          anonymousName: `User${localUser.id.slice(0, 4)}`,
          createdAt: new Date(localUser.createdAt),
          updatedAt: new Date(localUser.createdAt),
        },
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified: true,
      });
    } catch (error) {
      throw error;
    }
  },

  signOut: async () => {
    const { isDemoMode: isDemo } = get();
    
    // Clear all localStorage data on sign out
    if (typeof window !== 'undefined') {
      localStorage.removeItem("sahara-daily-chats");
      localStorage.removeItem("sahara-unlock-date");
      localStorage.removeItem("sahara-daily-progress");
      localStorage.removeItem("sahara-selected-pet");
      localStorage.removeItem("sahara-journal-entries");
      localStorage.removeItem("sahara-first-visit");
      localStorage.removeItem("sahara-user-state");
      localStorage.removeItem("sahara-habits-today");
      localStorage.removeItem("sahara-mood-today");
      localStorage.removeItem("sahara-streak");
      localStorage.removeItem("sahara-wellness-data");
      localStorage.removeItem("sahara-new-account");
      localStorage.removeItem("sahara-profile-complete");
      localStorage.removeItem("sahara-user-gender");
      localStorage.removeItem("sahara-user-id");
    }
    
    // Always sign out from local auth
    localSignOut();
    
    // If in demo mode, just reset the state
    if (isDemo) {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isDemoMode: false,
        isLoading: false,
      });
      return;
    }
    
    // Also sign out from Supabase if configured
    if (!isDemoMode()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchProfile: async () => {
    if (isDemoMode()) return;
    
    const supabase = createClient();
    const { user } = get();
    
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      return;
    }
    
    if (data) {
      set({
        profile: {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          sex: data.sex,
          age: data.age,
          medicalHistoryEncrypted: data.medical_history_encrypted,
          anonymousName: data.anonymous_name,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        },
      });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const { user, profile, isDemoMode: isDemo } = get();
    
    // Check if user is using local auth (has a local session)
    const localSession = getSession();
    const isLocalAuth = !!localSession;
    
    // For local/demo users, update in memory and localStorage
    if (isDemo || isLocalAuth || !user) {
      const userId = user?.id || localSession?.id || 'demo';
      
      // Create base profile if it doesn't exist
      const baseProfile: UserProfile = profile || {
        id: `local-${userId}`,
        userId: userId,
        anonymousName: data.name || `User-${userId.slice(0, 6)}`,
        name: null,
        sex: null,
        age: null,
        medicalHistoryEncrypted: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedProfile: UserProfile = {
        ...baseProfile,
        ...data,
        updatedAt: new Date(),
      };
      
      set({ profile: updatedProfile });
      
      // Also persist to localStorage for local auth users
      if ((isLocalAuth || isDemo) && typeof window !== 'undefined') {
        const profileKey = `sahara-profile-${userId}`;
        localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
      }
      
      return;
    }
    
    // For Supabase users
    if (!isDemoMode()) {
      const supabase = createClient();
      
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.sex !== undefined) updateData.sex = data.sex;
      if (data.age !== undefined) updateData.age = data.age;
      if (data.medicalHistoryEncrypted !== undefined) {
        updateData.medical_history_encrypted = data.medicalHistoryEncrypted;
      }
      updateData.updated_at = new Date().toISOString();
      
      if (profile) {
        const { error } = await supabase
          .from("user_profiles")
          .update(updateData)
          .eq("id", profile.id);
        
        if (error) throw error;
      } else {
        const { generateAnonymousName } = await import("@/lib/utils");
        const { error } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            anonymous_name: generateAnonymousName(),
            ...updateData,
          });
        
        if (error) throw error;
      }
      
      await get().fetchProfile();
    }
  },

  enableDemoMode: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("sahara-daily-chats");
      localStorage.removeItem("sahara-unlock-date");
      localStorage.removeItem("sahara-daily-progress");
      localStorage.removeItem("sahara-selected-pet");
      localStorage.removeItem("sahara-journal-entries");
      localStorage.removeItem("sahara-first-visit");
    }
    
    set({
      user: {
        id: "demo-user-id",
        email: "demo@sahara.app",
        createdAt: new Date(),
      },
      profile: {
        id: "demo-profile-id",
        userId: "demo-user-id",
        name: "Demo User",
        sex: null,
        age: null,
        medicalHistoryEncrypted: null,
        anonymousName: "GentleLeaf42",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isAuthenticated: true,
      isDemoMode: true,
      isLoading: false,
    });
  },

  verifyEmail: async () => {
    // Not needed for local auth
    set({ isEmailVerified: true });
  },

  resendVerificationEmail: async () => {
    // Not needed for local auth
  },

  checkEmailVerification: async () => {
    return true; // Local auth doesn't need verification
  },
}));
