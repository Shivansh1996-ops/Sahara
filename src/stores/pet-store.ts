import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Pet, UserPet, PetAnimationState } from "@/types";

// Default pets for demo mode - 1 dog and 1 cat only
function getDefaultPets(): Pet[] {
  return [
    {
      id: "pet-1",
      name: "Buddy",
      personality: "calm",
      imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&crop=face",
      animationConfig: { idle: "breathe", happy: "bounce", thinking: "sway", glow: "pulse", blink: "blink", breathe: "breathe" },
      aiToneModifier: "Respond with extra gentleness and calm, like a loyal Golden Retriever companion.",
      isDefault: true,
    },
    {
      id: "pet-2",
      name: "Whiskers",
      personality: "playful",
      imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop&crop=face",
      animationConfig: { idle: "bounce", happy: "spin", thinking: "tilt", glow: "sparkle", blink: "blink", breathe: "breathe" },
      aiToneModifier: "Be curious and playful like a friendly cat!",
      isDefault: false,
    },
  ];
}

interface PetState {
  pets: Pet[];
  activePet: Pet | null;
  userPet: UserPet | null;
  isLoading: boolean;
  currentAnimation: PetAnimationState;
  
  // Actions
  fetchPets: () => Promise<void>;
  fetchUserPet: (userId: string) => Promise<void>;
  selectPet: (userId: string, petId: string) => Promise<void>;
  setAnimation: (animation: PetAnimationState) => void;
  incrementBondLevel: (userId: string) => Promise<void>;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  activePet: null,
  userPet: null,
  isLoading: true,
  currentAnimation: "idle",

  fetchPets: async () => {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .order("is_default", { ascending: false });
      
      if (error) {
        // If error (likely demo mode), use default pets
        const defaultPets = getDefaultPets();
        const savedPetId = typeof window !== 'undefined' ? localStorage.getItem("sahara-selected-pet") : null;
        const activePet = savedPetId 
          ? defaultPets.find(p => p.id === savedPetId) || defaultPets[0]
          : defaultPets[0];
        
        set({
          pets: defaultPets,
          activePet,
          isLoading: false,
        });
        return;
      }
      
      if (!data || data.length === 0) {
        const defaultPets = getDefaultPets();
        const savedPetId = typeof window !== 'undefined' ? localStorage.getItem("sahara-selected-pet") : null;
        const activePet = savedPetId 
          ? defaultPets.find(p => p.id === savedPetId) || defaultPets[0]
          : defaultPets[0];
        
        set({ 
          pets: defaultPets,
          activePet,
          isLoading: false,
        });
        return;
      }
      
      const mappedPets = data.map((pet) => ({
        id: pet.id,
        name: pet.name,
        personality: pet.personality,
        imageUrl: pet.image_url,
        animationConfig: pet.animation_config,
        aiToneModifier: pet.ai_tone_modifier,
        isDefault: pet.is_default,
      }));
      
      const savedPetId = typeof window !== 'undefined' ? localStorage.getItem("sahara-selected-pet") : null;
      const activePet = savedPetId 
        ? mappedPets.find(p => p.id === savedPetId) || mappedPets[0]
        : mappedPets.find(p => p.isDefault) || mappedPets[0];
      
      set({
        pets: mappedPets,
        activePet,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching pets:", error);
      // Fallback to default pets
      const defaultPets = getDefaultPets();
      const savedPetId = typeof window !== 'undefined' ? localStorage.getItem("sahara-selected-pet") : null;
      const activePet = savedPetId 
        ? defaultPets.find(p => p.id === savedPetId) || defaultPets[0]
        : defaultPets[0];
      
      set({ 
        pets: defaultPets,
        activePet,
        isLoading: false,
      });
    }
  },

  fetchUserPet: async (userId: string) => {
    const supabase = createClient();
    
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from("user_pets")
        .select(`
          *,
          pet:pets(*)
        `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const petData = data.pet as any;
        set({
          userPet: {
            id: data.id,
            userId: data.user_id,
            petId: data.pet_id,
            bondLevel: data.bond_level,
            selectedAt: new Date(data.selected_at),
            isActive: data.is_active,
          },
          activePet: {
            id: petData.id,
            name: petData.name,
            personality: petData.personality,
            imageUrl: petData.image_url,
            animationConfig: petData.animation_config,
            aiToneModifier: petData.ai_tone_modifier,
            isDefault: petData.is_default,
          },
        });
      } else {
        // Get default pet if no user pet selected
        const { pets } = get();
        if (pets.length === 0) {
          await get().fetchPets();
        }
        const defaultPet = get().pets.find((p) => p.isDefault) || get().pets[0];
        if (defaultPet) {
          set({ activePet: defaultPet });
        }
      }
    } catch (error) {
      console.error("Error fetching user pet:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  selectPet: async (userId: string, petId: string) => {
    const supabase = createClient();
    
    try {
      // Deactivate current pet
      await supabase
        .from("user_pets")
        .update({ is_active: false })
        .eq("user_id", userId)
        .eq("is_active", true);
      
      // Check if user already has this pet
      const { data: existingPet } = await supabase
        .from("user_pets")
        .select("*")
        .eq("user_id", userId)
        .eq("pet_id", petId)
        .single();
      
      if (existingPet) {
        // Reactivate existing pet
        await supabase
          .from("user_pets")
          .update({ is_active: true, selected_at: new Date().toISOString() })
          .eq("id", existingPet.id);
      } else {
        // Create new user pet
        await supabase
          .from("user_pets")
          .insert({
            user_id: userId,
            pet_id: petId,
            bond_level: 0,
            is_active: true,
          });
      }
      
      // Refresh user pet
      await get().fetchUserPet(userId);
      
    } catch (error) {
      console.error("Error selecting pet:", error);
      throw error;
    }
  },

  setAnimation: (animation: PetAnimationState) => {
    set({ currentAnimation: animation });
  },

  incrementBondLevel: async (userId: string) => {
    const supabase = createClient();
    const { userPet } = get();
    
    if (!userPet) return;
    
    try {
      const newBondLevel = Math.min(userPet.bondLevel + 1, 100);
      
      await supabase
        .from("user_pets")
        .update({ bond_level: newBondLevel })
        .eq("id", userPet.id);
      
      set({
        userPet: {
          ...userPet,
          bondLevel: newBondLevel,
        },
      });
    } catch (error) {
      console.error("Error incrementing bond level:", error);
    }
  },
}));
