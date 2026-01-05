"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Heart, Leaf } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function Loading({ size = "md", className, text }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer ring with gradient */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-sage-200"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Spinning arc */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-sage-500 border-r-sage-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner breathing dot with gradient */}
        <motion.div 
          className="absolute inset-2 rounded-full bg-gradient-to-br from-sage-400 to-sage-500"
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {text && (
        <motion.p 
          className="text-sm text-sage-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function LoadingScreen({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-sage-50 via-beige-50 to-soft-blue-50">
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-1/4 left-1/4"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Leaf className="w-8 h-8 text-sage-300" />
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 right-1/4"
        animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Heart className="w-6 h-6 text-rose-300" />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/3"
        animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Sparkles className="w-7 h-7 text-amber-300" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Main loader */}
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 shadow-lg shadow-sage-200/50"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-sage-400"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        </div>

        {/* Text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-lg font-semibold text-sage-700">{text}</p>
          <motion.p 
            className="text-sm text-sage-500 mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Taking a moment to breathe...
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div 
        className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sage-400 to-sage-500"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div 
        className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sage-400 to-sage-500"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
      />
      <motion.div 
        className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sage-400 to-sage-500"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("bg-gradient-to-r from-beige-100 via-beige-200 to-beige-100 rounded-lg", className)}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{ backgroundSize: "200% 100%" }}
    />
  );
}
