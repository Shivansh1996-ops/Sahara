"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, Shield } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { signInWithEmail, signUpWithEmail, enableDemoMode } = useAuthStore();

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!email.trim()) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      setIsLoading(false);
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        setSuccess("Welcome back! Redirecting...");
        setTimeout(() => {
          onClose();
          router.push('/dashboard');
        }, 500);
      } else {
        // For signup, don't pass name - we'll collect profile info separately
        await signUpWithEmail(email, password);
        setSuccess("Account created! Let's set up your profile...");
        setTimeout(() => {
          onClose();
          // Redirect to profile setup page
          router.push('/profile-setup');
        }, 500);
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
    router.push('/dashboard');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "signin" ? "Welcome back" : "Create your account"}
      description={
        mode === "signin"
          ? "Sign in to continue your wellness journey"
          : "Your identity is protected with a unique Sahara ID"
      }
    >
      <div className="space-y-4">
        {/* Privacy Notice for Signup */}
        {mode === "signup" && (
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-alt)] rounded-xl border border-[var(--border)]">
            <Shield className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[var(--text-muted)]">
              <p className="font-medium text-[var(--text)] mb-1">Privacy First</p>
              <p>You&apos;ll be assigned a unique <span className="font-semibold text-[var(--primary)]">Sahara ID</span> to protect your identity. No real name required.</p>
            </div>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-light)]" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="pl-10 h-12 rounded-xl bg-[var(--bg-alt)] border-[var(--border)] focus:border-[var(--primary)]"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-light)]" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="pl-10 pr-10 h-12 rounded-xl bg-[var(--bg-alt)] border-[var(--border)] focus:border-[var(--primary)]"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text-muted)]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === "signup" && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-light)]" />
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="pl-10 h-12 rounded-xl bg-[var(--bg-alt)] border-[var(--border)] focus:border-[var(--primary)]"
                required
                minLength={6}
              />
            </div>
          )}

          {mode === "signup" && (
            <p className="text-xs text-[var(--text-light)]">
              Password must be at least 6 characters long
            </p>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-4 rounded-xl border border-red-200 dark:border-red-900"
            >
              <p>{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-4 rounded-xl border border-green-200 dark:border-green-900 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <p>{success}</p>
            </motion.div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium"
            isLoading={isLoading}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        {/* Toggle Mode */}
        <p className="text-center text-sm text-[var(--text-muted)]">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-semibold text-[var(--accent)] hover:underline"
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
                className="font-semibold text-[var(--accent)] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--card)] px-2 text-[var(--text-light)]">Or</span>
          </div>
        </div>

        {/* Demo Mode Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleDemoMode}
          className="w-full h-12 rounded-xl"
        >
          <Sparkles className="w-4 h-4 mr-2 text-[var(--accent)]" />
          Try Demo Mode (No Login Required)
        </Button>

        {/* Terms */}
        <p className="text-xs text-center text-[var(--text-light)]">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-[var(--text-muted)]">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-[var(--text-muted)]">
            Privacy Policy
          </a>
        </p>
      </div>
    </Modal>
  );
}
