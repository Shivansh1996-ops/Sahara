"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Heart, Settings, Bell, Shield, ChevronRight, Check, LogOut, X, Moon, Sun, Volume2, VolumeX, Globe, Lock, Save, Copy, Calendar, FileText } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationSettings {
  dailyReminders: boolean;
  moodCheckIns: boolean;
  communityUpdates: boolean;
  therapistMessages: boolean;
  weeklyReports: boolean;
}

interface PrivacySettings {
  profileVisible: boolean;
  showActivity: boolean;
  allowMessages: boolean;
  dataCollection: boolean;
}

interface AppSettings {
  theme: "light" | "dark" | "system";
  soundEffects: boolean;
  language: string;
  petSounds: boolean;
}

const petOptions = [
  {
    id: "dog",
    name: "Buddy",
    type: "dog",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&crop=face",
    description: "Energetic and encouraging companion",
    personality: "Motivating & Playful",
  },
  {
    id: "cat",
    name: "Whiskers",
    type: "cat",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop&crop=face",
    description: "Calm and soothing presence",
    personality: "Peaceful & Wise",
  },
];

const genderLabels: Record<string, string> = {
  male: "Male",
  female: "Female",
  "non-binary": "Non-Binary",
  other: "Other",
  "prefer-not-say": "Not specified",
};

export default function ProfilePage() {
  const router = useRouter();
  const { profile, signOut, updateProfile } = useAuthStore();
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [activeModal, setActiveModal] = useState<"medical" | "notifications" | "privacy" | "settings" | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [saharaId, setSaharaId] = useState("");
  const [userAge, setUserAge] = useState<number | null>(null);
  const [userGender, setUserGender] = useState<string>("");
  const [userSex, setUserSex] = useState<string>("");
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    dailyReminders: true,
    moodCheckIns: true,
    communityUpdates: false,
    therapistMessages: true,
    weeklyReports: true,
  });
  
  // Privacy State
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisible: true,
    showActivity: false,
    allowMessages: true,
    dataCollection: true,
  });
  
  // App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: "light",
    soundEffects: true,
    language: "English",
    petSounds: true,
  });

  useEffect(() => {
    // Load Sahara ID
    const savedId = localStorage.getItem("sahara-user-id");
    if (savedId) setSaharaId(savedId);
    else if (profile?.name?.startsWith("SH-")) setSaharaId(profile.name);

    // Load saved pet
    const saved = localStorage.getItem("sahara-selected-pet");
    if (saved) setSelectedPet(saved);
    
    // Load user profile data
    if (profile) {
      setUserAge(profile.age || null);
      if (profile.medicalHistoryEncrypted) {
        try {
          const data = JSON.parse(profile.medicalHistoryEncrypted);
          setUserGender(data.gender || "");
          setMedicalHistory(data.medicalHistory || []);
        } catch {}
      }
      setUserSex(profile.sex || "");
    }
    
    // Load saved gender from localStorage
    const savedGender = localStorage.getItem("sahara-user-gender");
    if (savedGender) setUserGender(savedGender);
    
    // Load saved settings
    const savedNotifications = localStorage.getItem("sahara-notifications");
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    
    const savedPrivacy = localStorage.getItem("sahara-privacy");
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
    
    const savedAppSettings = localStorage.getItem("sahara-app-settings");
    if (savedAppSettings) setAppSettings(JSON.parse(savedAppSettings));
  }, [profile]);

  const showNotificationMessage = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectPet = (petId: string) => {
    setSelectedPet(petId);
    localStorage.setItem("sahara-selected-pet", petId);
    setShowPetSelector(false);
    showNotificationMessage(`${petOptions.find(p => p.id === petId)?.name} is now your companion! 🎉`);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(saharaId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showNotificationMessage("Sahara ID copied to clipboard! 📋");
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("sahara-notifications", JSON.stringify(notifications));
    setActiveModal(null);
    showNotificationMessage("Notification preferences saved! 🔔");
  };

  const handleSavePrivacy = () => {
    localStorage.setItem("sahara-privacy", JSON.stringify(privacy));
    setActiveModal(null);
    showNotificationMessage("Privacy settings updated! 🔒");
  };

  const handleSaveAppSettings = () => {
    localStorage.setItem("sahara-app-settings", JSON.stringify(appSettings));
    setActiveModal(null);
    showNotificationMessage("Settings saved! ⚙️");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const currentPet = petOptions.find(p => p.id === selectedPet);

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={cn("w-12 h-6 rounded-full transition-colors relative", enabled ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600")}>
      <motion.div
        className="w-5 h-5 bg-white rounded-full absolute top-0.5"
        animate={{ left: enabled ? "26px" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );

  const medicalHistoryLabels: Record<string, string> = {
    "anxiety": "Anxiety",
    "depression": "Depression",
    "ptsd": "PTSD / Trauma",
    "ocd": "OCD",
    "bipolar": "Bipolar Disorder",
    "adhd": "ADHD",
    "eating-disorder": "Eating Disorder",
    "substance": "Substance Use",
    "sleep": "Sleep Disorders",
    "chronic-pain": "Chronic Pain",
    "none": "None",
    "prefer-not-say": "Not specified",
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[var(--bg)] to-[var(--card)]">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white px-6 py-3 rounded-full shadow-lg shadow-[var(--primary)]/20"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical History Modal */}
      <AnimatePresence>
        {activeModal === "medical" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[var(--text)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--primary)]" /> Health Profile
                </h3>
                <button onClick={() => setActiveModal(null)}><X className="w-5 h-5 text-[var(--text-light)]" /></button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-[var(--bg-alt)] rounded-xl">
                  <p className="text-xs text-[var(--text-light)] mb-1">Age</p>
                  <p className="font-semibold text-[var(--text)]">{userAge || "Not specified"}</p>
                </div>
                
                <div className="p-4 bg-[var(--bg-alt)] rounded-xl">
                  <p className="text-xs text-[var(--text-light)] mb-1">Gender Identity</p>
                  <p className="font-semibold text-[var(--text)]">{genderLabels[userGender] || "Not specified"}</p>
                </div>
                
                <div className="p-4 bg-[var(--bg-alt)] rounded-xl">
                  <p className="text-xs text-[var(--text-light)] mb-1">Biological Sex</p>
                  <p className="font-semibold text-[var(--text)] capitalize">{userSex || "Not specified"}</p>
                </div>
                
                <div className="p-4 bg-[var(--bg-alt)] rounded-xl">
                  <p className="text-xs text-[var(--text-light)] mb-2">Mental Health Background</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.length > 0 ? (
                      medicalHistory.map((item) => (
                        <span key={item} className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm">
                          {medicalHistoryLabels[item] || item}
                        </span>
                      ))
                    ) : (
                      <span className="text-[var(--text-light)]">Not specified</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-[var(--bg-alt)] rounded-xl">
                  <Lock className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[var(--text-muted)]">
                    Your health data is encrypted and stored securely.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {activeModal === "notifications" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[var(--text)] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[var(--primary)]" /> Notifications
                </h3>
                <button onClick={() => setActiveModal(null)}><X className="w-5 h-5 text-[var(--text-light)]" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { key: "dailyReminders", label: "Daily Reminders", desc: "Get daily wellness check-in reminders" },
                  { key: "moodCheckIns", label: "Mood Check-ins", desc: "Reminders to log your mood" },
                  { key: "communityUpdates", label: "Community Updates", desc: "New posts and replies in groups" },
                  { key: "therapistMessages", label: "Therapist Messages", desc: "Messages from your therapist" },
                  { key: "weeklyReports", label: "Weekly Reports", desc: "Your weekly wellness summary" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-[var(--text)]">{item.label}</p>
                      <p className="text-xs text-[var(--text-light)]">{item.desc}</p>
                    </div>
                    <ToggleSwitch
                      enabled={notifications[item.key as keyof NotificationSettings]}
                      onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof NotificationSettings] })}
                    />
                  </div>
                ))}
                <Button onClick={handleSaveNotifications} className="w-full bg-[var(--primary)] text-white rounded-xl h-12 mt-4">
                  <Save className="w-4 h-4 mr-2" /> Save Preferences
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {activeModal === "privacy" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[var(--text)] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--primary)]" /> Privacy
                </h3>
                <button onClick={() => setActiveModal(null)}><X className="w-5 h-5 text-[var(--text-light)]" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { key: "profileVisible", label: "Profile Visible", desc: "Allow others to see your profile" },
                  { key: "showActivity", label: "Show Activity", desc: "Display your activity status" },
                  { key: "allowMessages", label: "Allow Messages", desc: "Receive messages from community members" },
                  { key: "dataCollection", label: "Analytics", desc: "Help improve Sahara with anonymous data" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-[var(--text)]">{item.label}</p>
                      <p className="text-xs text-[var(--text-light)]">{item.desc}</p>
                    </div>
                    <ToggleSwitch
                      enabled={privacy[item.key as keyof PrivacySettings]}
                      onChange={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key as keyof PrivacySettings] })}
                    />
                  </div>
                ))}
                <Button onClick={handleSavePrivacy} className="w-full bg-[var(--primary)] text-white rounded-xl h-12 mt-4">
                  <Save className="w-4 h-4 mr-2" /> Save Privacy Settings
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {activeModal === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[var(--text)] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[var(--primary)]" /> Settings
                </h3>
                <button onClick={() => setActiveModal(null)}><X className="w-5 h-5 text-[var(--text-light)]" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {appSettings.theme === "dark" ? <Moon className="w-5 h-5 text-[var(--primary)]" /> : <Sun className="w-5 h-5 text-[var(--primary)]" />}
                    <div>
                      <p className="font-medium text-[var(--text)]">Theme</p>
                      <p className="text-xs text-[var(--text-light)]">Choose your preferred theme</p>
                    </div>
                  </div>
                  <select
                    value={appSettings.theme}
                    onChange={(e) => setAppSettings({ ...appSettings, theme: e.target.value as AppSettings["theme"] })}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--border)] text-sm text-[var(--text)]"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {appSettings.soundEffects ? <Volume2 className="w-5 h-5 text-[var(--primary)]" /> : <VolumeX className="w-5 h-5 text-[var(--primary)]" />}
                    <div>
                      <p className="font-medium text-[var(--text)]">Sound Effects</p>
                      <p className="text-xs text-[var(--text-light)]">UI sounds and notifications</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={appSettings.soundEffects}
                    onChange={() => setAppSettings({ ...appSettings, soundEffects: !appSettings.soundEffects })}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-[var(--primary)]" />
                    <div>
                      <p className="font-medium text-[var(--text)]">Pet Sounds</p>
                      <p className="text-xs text-[var(--text-light)]">Companion voices and sounds</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={appSettings.petSounds}
                    onChange={() => setAppSettings({ ...appSettings, petSounds: !appSettings.petSounds })}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[var(--primary)]" />
                    <div>
                      <p className="font-medium text-[var(--text)]">Language</p>
                      <p className="text-xs text-[var(--text-light)]">Select your language</p>
                    </div>
                  </div>
                  <select
                    value={appSettings.language}
                    onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--border)] text-sm text-[var(--text)]"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <Button onClick={handleSaveAppSettings} className="w-full bg-[var(--primary)] text-white rounded-xl h-12 mt-4">
                  <Save className="w-4 h-4 mr-2" /> Save Settings
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="pt-6 pb-5"
        >
          <div className="flex items-center gap-4 mb-5">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] shadow-lg"
            >
              <User className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Profile</h1>
              <p className="text-sm text-[var(--text-muted)]">Manage your account</p>
            </div>
          </div>
          
          {/* Profile Card */}
          <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] text-center shadow-sm">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white relative shadow-xl shadow-[var(--primary)]/20"
            >
              <Shield className="w-10 h-10" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-3 border-[var(--card)] shadow-lg">
                <Check className="w-4 h-4 text-white" />
              </div>
            </motion.div>
            
            {/* Sahara ID */}
            <div className="mb-3">
              <p className="text-xs text-[var(--text-light)] mb-1">SAHARA ID</p>
              <button 
                onClick={handleCopyId}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-alt)] rounded-lg hover:bg-[var(--border)] transition-colors group"
              >
                <span className="text-sm font-mono font-semibold text-[var(--primary)] tracking-wide">
                  {saharaId || profile?.name || "SH-XXXX-XXXX"}
                </span>
                {copied ? (
                  <Check className="w-3 h-3 text-[#22c55e]" />
                ) : (
                  <Copy className="w-3 h-3 text-[var(--text-light)] group-hover:text-[var(--primary)]" />
                )}
              </button>
            </div>
            
            <p className="text-sm text-[var(--text-muted)]">{profile?.anonymousName || "Anonymous User"}</p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
              {userAge && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{userAge} years</span>
                </div>
              )}
              {userGender && userGender !== "prefer-not-say" && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <User className="w-3.5 h-3.5" />
                  <span>{genderLabels[userGender]}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Current Pet Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="bg-[var(--card)] rounded-2xl p-5 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text)]">My Companion</h3>
              <Button onClick={() => setShowPetSelector(!showPetSelector)} variant="secondary" className="rounded-full text-sm">
                Change Pet
              </Button>
            </div>
            
            {currentPet ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden relative">
                  <Image src={currentPet.image} alt={currentPet.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--text)] text-lg">{currentPet.name}</h4>
                  <p className="text-sm text-[var(--text-muted)]">{currentPet.personality}</p>
                  <p className="text-xs text-[var(--primary)] mt-1">{currentPet.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-light)] text-center py-4">No pet selected yet</p>
            )}

            <AnimatePresence>
              {showPetSelector && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--text-muted)] mb-3">Choose your wellness companion:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {petOptions.map((pet) => (
                      <button
                        key={pet.id}
                        onClick={() => handleSelectPet(pet.id)}
                        className={cn(
                          "relative p-3 rounded-xl border-2 transition-all text-left",
                          selectedPet === pet.id ? "border-[var(--primary)] bg-[var(--bg-alt)]" : "border-[var(--border)] hover:border-[var(--primary)]/50"
                        )}
                      >
                        {selectedPet === pet.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="w-12 h-12 rounded-lg overflow-hidden relative mb-2">
                          <Image src={pet.image} alt={pet.name} fill className="object-cover" />
                        </div>
                        <p className="font-medium text-[var(--text)] text-sm">{pet.name}</p>
                        <p className="text-xs text-[var(--text-light)]">{pet.personality}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Settings Menu */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          {[
            { icon: FileText, label: "Health Profile", desc: "View your health information", action: () => setActiveModal("medical") },
            { icon: Bell, label: "Notifications", desc: "Manage alerts", action: () => setActiveModal("notifications") },
            { icon: Shield, label: "Privacy", desc: "Control your data", action: () => setActiveModal("privacy") },
            { icon: Settings, label: "Settings", desc: "App preferences", action: () => setActiveModal("settings") },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-alt)] transition-colors border-b border-[var(--border)] last:border-b-0"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-alt)] flex items-center justify-center">
                <item.icon className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-[var(--text)]">{item.label}</p>
                <p className="text-xs text-[var(--text-light)]">{item.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-light)]" />
            </button>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          <Button onClick={handleSignOut} className="w-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-xl h-12 border border-red-100 dark:border-red-900">
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
