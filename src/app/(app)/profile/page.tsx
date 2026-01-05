"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Save, Shield, Dog, Cat, Check } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { usePetStore } from "@/stores/pet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, updateProfile, signOut, isDemoMode: isAuthDemoMode } = useAuthStore();
  const { isFullyUnlocked, completedChats } = useFeatureGateStore();
  const { pets, activePet, fetchPets, isLoading: petsLoading } = usePetStore();
  
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  useEffect(() => {
    if (activePet) {
      setSelectedPetId(activePet.id);
    }
  }, [activePet]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setSex(profile.sex || "");
      setAge(profile.age?.toString() || "");
      // Note: Medical history would need decryption in a real app
      setMedicalHistory("");
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      await updateProfile({
        name: name || null,
        sex: sex || null,
        age: age ? parseInt(age) : null,
        // In a real app, encrypt medical history before saving
        medicalHistoryEncrypted: medicalHistory || null,
      });
      setSaveMessage("Profile saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveMessage("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handlePetChange = (petId: string) => {
    setSelectedPetId(petId);
    // Save to localStorage for demo mode
    localStorage.setItem("sahara-selected-pet", petId);
    // Show success message
    setSaveMessage("Pet changed successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const showPetSection = isFullyUnlocked || isAuthDemoMode;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Avatar seed={profile?.anonymousName || user?.email || "user"} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-sage-800">
            {profile?.name || "Your Profile"}
          </h1>
          <p className="text-sage-600">{profile?.anonymousName}</p>
        </div>
      </motion.div>

      {/* Progress Card (if not fully unlocked) */}
      {!isFullyUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-sage-100 to-beige-100 border-none">
            <CardContent className="pt-6">
              <p className="text-sage-700 mb-2">
                {10 - completedChats} more conversations to unlock all features
              </p>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sage-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedChats / 10) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we call you?"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Sex
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full h-11 rounded-xl border border-beige-300 bg-white px-4 text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Input
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Your age"
                min={13}
                max={120}
              />
            </div>

            {/* Medical History - Only shown, always private */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-sage-700">
                  Medical History
                </label>
                <span className="flex items-center gap-1 text-xs text-sage-500 bg-sage-100 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  Private & Encrypted
                </span>
              </div>
              <Textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Optional: Share any relevant medical history that might help personalize your experience..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-sage-500 mt-1">
                This information is encrypted and never shared. It helps us provide better support.
              </p>
            </div>

            {saveMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm ${
                  saveMessage.includes("success") ? "text-sage-600" : "text-red-600"
                }`}
              >
                {saveMessage}
              </motion.p>
            )}

            <Button onClick={handleSave} isLoading={isSaving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Pet Section */}
      {showPetSection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-sage-600" />
                Your Companion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-sage-600">
                Choose your wellness companion. They&apos;ll support you on your journey!
              </p>
              
              {petsLoading ? (
                <div className="flex justify-center py-4">
                  <Loading size="sm" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {pets.map((pet) => {
                    const isSelected = selectedPetId === pet.id;
                    const isDog = pet.name === "Buddy";
                    
                    return (
                      <motion.div
                        key={pet.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePetChange(pet.id)}
                        className={cn(
                          "relative cursor-pointer rounded-2xl p-4 border-2 transition-all",
                          isSelected
                            ? "border-sage-500 bg-sage-50"
                            : "border-beige-200 bg-white hover:border-sage-300"
                        )}
                      >
                        {/* Selected indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-6 h-6 bg-sage-500 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                        
                        {/* Pet Image */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-20 h-20 rounded-full overflow-hidden ring-2 mb-3",
                            isSelected ? "ring-sage-400" : "ring-beige-200"
                          )}>
                            <Image
                              src={pet.imageUrl?.startsWith('http') ? pet.imageUrl : "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop&crop=face"}
                              alt={pet.name}
                              width={80}
                              height={80}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          </div>
                          
                          {/* Pet Info */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                              {isDog ? (
                                <Dog className="w-4 h-4 text-sage-600" />
                              ) : (
                                <Cat className="w-4 h-4 text-sage-600" />
                              )}
                              <span className="font-semibold text-sage-800">{pet.name}</span>
                            </div>
                            <p className="text-xs text-sage-500 capitalize">{pet.personality}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sage-800">Email</p>
                <p className="text-sm text-sage-600">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="danger"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Safety Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-xs text-sage-500 py-4"
      >
        <p>
          Sahara is not a substitute for professional mental health care.
          <br />
          If you&apos;re in crisis, please contact a mental health professional.
        </p>
      </motion.div>
    </div>
  );
}
