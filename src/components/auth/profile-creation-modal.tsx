"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, Lock, User, Eye, EyeOff, Sparkles, Check, 
  Heart, BarChart3, Users, Dog
} from "lucide-react";

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ProfileCreationModal({ isOpen, onClose, onComplete }: ProfileCreationModalProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signUpWithEmail, signInWithGoogle } = useAuthStore();

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithGoogle();
      onComplete();
    } catch (err) {
      setError("Failed to sign up with Google. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate email
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }
      setError("");
      setStep(2);
      return;
    }

    if (step === 2) {
      // Validate password
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setError("");
      setStep(3);
      return;
    }

    // Step 3 - Create account
    setIsLoading(true);
    setError("");

    try {
      await signUpWithEmail(email, password);
      onComplete();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const features = [
    { icon: Dog, title: "Pet Companion", desc: "Your wellness buddy" },
    { icon: BarChart3, title: "Wellness Dashboard", desc: "Track your progress" },
    { icon: Users, title: "Community", desc: "Connect with others" },
    { icon: Heart, title: "Full Profile", desc: "Personalized experience" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      description=""
    >
      <div className="space-y-6">
        {/* Celebration Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sage-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-sage-800 mb-2">
            🎉 Congratulations!
          </h2>
          <p className="text-sage-600">
            You&apos;ve completed 10 conversations and unlocked all features!
          </p>
        </motion.div>

        {/* Unlocked Features */}
        <div className="grid grid-cols-2 gap-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 p-3 bg-sage-50 rounded-xl"
            >
              <div className="w-8 h-8 bg-sage-200 rounded-lg flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-sage-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-sage-700">{feature.title}</p>
                <p className="text-xs text-sage-500">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Account Section */}
        <div className="border-t border-beige-200 pt-4">
          <p className="text-center text-sage-700 font-medium mb-4">
            Create an account to save your progress
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? "bg-sage-500 text-white"
                    : "bg-beige-100 text-sage-400"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>

          {/* Google Sign Up */}
          {step === 1 && (
            <>
              <Button
                variant="outline"
                className="w-full mb-3"
                onClick={handleGoogleSignUp}
                isLoading={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-beige-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-sage-500">Or with email</span>
                </div>
              </div>
            </>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {step === 1 && (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="pl-10"
                  required
                />
              </div>
            )}

            {step === 2 && (
              <>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password (min 8 characters)"
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="pl-10"
                    required
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="pl-10"
                />
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 p-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                {step === 3 ? "Create Account" : "Continue"}
              </Button>
            </div>
          </form>

          {/* Skip Option */}
          <button
            type="button"
            onClick={handleSkip}
            className="w-full mt-3 text-sm text-sage-500 hover:text-sage-700"
          >
            Skip for now (you can create an account later)
          </button>
        </div>
      </div>
    </Modal>
  );
}
