import { create } from "zustand";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import type { User, UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  enableDemoMode: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isDemoMode: isDemoMode(),

  initialize: async () => {
    // Check if we're in demo mode from store state (not env)
    const { isDemoMode: isDemo, isAuthenticated } = get();
    
    // If already authenticated (e.g., demo mode), don't re-initialize
    if (isDemo && isAuthenticated) {
      set({ isLoading: false });
      return;
    }
    
    // Check if we're in demo mode from environment
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

    // Listen for auth changes
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
  },

  signInWithGoogle: async () => {
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
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  },

  signUpWithEmail: async (email: string, password: string) => {
    const supabase = createClient();
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
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
    }
    
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
    
    const supabase = createClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchProfile: async () => {
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
    if (isDemoMode()) return;
    
    const supabase = createClient();
    const { user, profile } = get();
    
    if (!user) throw new Error("Not authenticated");
    
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
  },

  enableDemoMode: () => {
    // Clear any existing localStorage data for fresh start
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
}));
