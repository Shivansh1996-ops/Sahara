"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";
import { isDemoMode } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, enableDemoMode } = useAuthStore();

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError("");
      setSuccess("");
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [mode]);

  const handleGoogleSignIn = async () => {
    // Check if in demo mode
    if (isDemoMode()) {
      setError("Google login requires Supabase configuration. Use 'Start Your Journey' for demo mode, or configure Supabase for full authentication.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if in demo mode
    if (isDemoMode()) {
      setError("Email authentication requires Supabase configuration. Use 'Start Your Journey' for demo mode.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        onClose();
      } else {
        await signUpWithEmail(email, password);
        setSuccess("Account created! Please check your email to verify your account.");
        // Clear form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
      }
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

  const handleDemoMode = () => {
    enableDemoMode();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "signin" ? "Welcome back" : "Create your account"}
      description={
        mode === "signin"
          ? "Sign in to continue your wellness journey"
          : "Join Sahara and start your wellness journey"
      }
    >
      <div className="space-y-4">
        {/* Google Sign In */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          isLoading={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-beige-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-sage-500">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === "signup" && (
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
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="pl-10 pr-10"
              required
              minLength={mode === "signup" ? 8 : 6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === "signup" && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="pl-10"
                required
                minLength={8}
              />
            </div>
          )}

          {mode === "signup" && (
            <p className="text-xs text-sage-500">
              Password must be at least 8 characters long
            </p>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 bg-red-50 p-3 rounded-lg space-y-2"
            >
              <p>{error}</p>
              {isDemoMode() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDemoMode}
                  className="w-full mt-2 border-sage-300 text-sage-700 hover:bg-sage-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Demo Mode Instead
                </Button>
              )}
            </motion.div>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-sage-700 bg-sage-50 p-3 rounded-lg"
            >
              {success}
            </motion.p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        {/* Toggle Mode */}
        <p className="text-center text-sm text-sage-600">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-medium text-sage-700 hover:text-sage-800 underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-medium text-sage-700 hover:text-sage-800 underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Terms */}
        <p className="text-xs text-center text-sage-500">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-sage-700">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-sage-700">
            Privacy Policy
          </a>
        </p>
      </div>
    </Modal>
  );
}
