"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, BookOpen, Target, Heart, Wind, Sparkles,
  ChevronRight, CheckCircle2, Clock, ArrowLeft, X
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { 
  cbtExercises, 
  cognitiveDistortions, 
  identifyDistortions,
  type CBTExercise,
  type CognitiveDistortion 
} from "@/lib/cbt-engine";
import { cn } from "@/lib/utils";

interface ExerciseProgress {
  exerciseId: string;
  currentStep: number;
  responses: Record<number, string | number | string[]>;
  startedAt: Date;
}

export default function ToolsPage() {
  const { isDemoMode: isAuthDemoMode } = useAuthStore();
  const { isFullyUnlocked } = useFeatureGateStore();
  const [selectedExercise, setSelectedExercise] = useState<CBTExercise | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showDistortionInfo, setShowDistortionInfo] = useState<CognitiveDistortion | null>(null);

  // Load completed exercises from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sahara-cbt-completed");
    if (saved) {
      // Defer to avoid synchronous setState inside effect
      setTimeout(() => setCompletedExercises(JSON.parse(saved)), 0);
    }
  }, []);

  const showTools = isFullyUnlocked || isAuthDemoMode;

  const startExercise = (exercise: CBTExercise) => {
    setSelectedExercise(exercise);
    setExerciseProgress({
      exerciseId: exercise.id,
      currentStep: 0,
      responses: {},
      startedAt: new Date()
    });
  };

  const handleStepResponse = (stepId: number, response: string | number | string[]) => {
    if (!exerciseProgress) return;
    
    setExerciseProgress({
      ...exerciseProgress,
      responses: {
        ...exerciseProgress.responses,
        [stepId]: response
      }
    });
  };

  const nextStep = () => {
    if (!exerciseProgress || !selectedExercise) return;
    
    if (exerciseProgress.currentStep < selectedExercise.steps.length - 1) {
      setExerciseProgress({
        ...exerciseProgress,
        currentStep: exerciseProgress.currentStep + 1
      });
    } else {
      // Exercise complete
      completeExercise();
    }
  };

  const prevStep = () => {
    if (!exerciseProgress) return;
    
    if (exerciseProgress.currentStep > 0) {
      setExerciseProgress({
        ...exerciseProgress,
        currentStep: exerciseProgress.currentStep - 1
      });
    }
  };

  const completeExercise = () => {
    if (!selectedExercise) return;
    
    const newCompleted = [...completedExercises, selectedExercise.id];
    setCompletedExercises(newCompleted);
    localStorage.setItem("sahara-cbt-completed", JSON.stringify(newCompleted));
    
    // Reset
    setSelectedExercise(null);
    setExerciseProgress(null);
  };

  const closeExercise = () => {
    setSelectedExercise(null);
    setExerciseProgress(null);
  };

  if (!showTools) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <Brain className="w-12 h-12 text-[var(--text-light)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">
              Complete 10 chat sessions to unlock CBT tools.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exercise in progress view
  if (selectedExercise && exerciseProgress) {
    const currentStep = selectedExercise.steps[exerciseProgress.currentStep];
    const progress = ((exerciseProgress.currentStep + 1) / selectedExercise.steps.length) * 100;

    return (
      <div className="min-h-screen p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={closeExercise} className="p-2 hover:bg-[var(--bg-alt)] rounded-full">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <h1 className="font-semibold text-[var(--text)]">{selectedExercise.title}</h1>
          <div className="w-9" />
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[var(--bg-alt)] rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-[var(--primary)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={exerciseProgress.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[var(--text)]">
                  Step {exerciseProgress.currentStep + 1}: {currentStep.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[var(--text-muted)]">{currentStep.instruction}</p>

                {/* Input based on type */}
                {currentStep.inputType === 'text' && (
                  <Textarea
                    placeholder="Write your thoughts here..."
                    value={(exerciseProgress.responses[currentStep.id] as string) || ''}
                    onChange={(e) => handleStepResponse(currentStep.id, e.target.value)}
                    className="min-h-[120px]"
                  />
                )}

                {currentStep.inputType === 'scale' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-[var(--text-light)]">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(exerciseProgress.responses[currentStep.id] as number) || 50}
                      onChange={(e) => handleStepResponse(currentStep.id, parseInt(e.target.value))}
                      className="w-full accent-[var(--primary)]"
                    />
                    <p className="text-center text-2xl font-bold text-[var(--text)]">
                      {(exerciseProgress.responses[currentStep.id] as number) || 50}
                    </p>
                  </div>
                )}

                {currentStep.inputType === 'multiselect' && currentStep.options && (
                  <div className="grid grid-cols-1 gap-2">
                    {currentStep.options.map((option) => {
                      const distortion = cognitiveDistortions[option as CognitiveDistortion];
                      const selected = ((exerciseProgress.responses[currentStep.id] as string[]) || []).includes(option);
                      
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            const current = (exerciseProgress.responses[currentStep.id] as string[]) || [];
                            const updated = selected
                              ? current.filter(o => o !== option)
                              : [...current, option];
                            handleStepResponse(currentStep.id, updated);
                          }}
                          className={cn(
                            "p-3 rounded-lg text-left transition-all border",
                            selected
                              ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                              : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[var(--text)]">{distortion?.name || option}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDistortionInfo(option as CognitiveDistortion);
                              }}
                              className="text-[var(--text-light)] hover:text-[var(--primary)]"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentStep.inputType === 'none' && (
                  <div className="p-4 bg-[var(--bg-alt)] rounded-lg text-center">
                    <p className="text-[var(--text-muted)]">Take a moment to follow this instruction.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auto-identify distortions for thought record */}
            {selectedExercise.id === 'thought_record' && 
             exerciseProgress.currentStep === 3 && 
             exerciseProgress.responses[2] && (
              <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
                <CardContent className="p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Based on your thought, these patterns might be present:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {identifyDistortions(exerciseProgress.responses[2] as string).map(d => (
                      <span key={d} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full text-xs">
                        {cognitiveDistortions[d].name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-[var(--card)] border-t border-[var(--border)]">
          <div className="flex gap-3 max-w-lg mx-auto">
            {exerciseProgress.currentStep > 0 && (
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button onClick={nextStep} className="flex-1">
              {exerciseProgress.currentStep === selectedExercise.steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Distortion Info Modal */}
        <Modal
          isOpen={!!showDistortionInfo}
          onClose={() => setShowDistortionInfo(null)}
          title={showDistortionInfo ? cognitiveDistortions[showDistortionInfo].name : ''}
        >
          {showDistortionInfo && (
            <div className="space-y-4">
              <p className="text-[var(--text-muted)]">{cognitiveDistortions[showDistortionInfo].description}</p>
              <div className="p-3 bg-[var(--bg-alt)] rounded-lg">
                <p className="text-sm text-[var(--text-light)] mb-1">Example:</p>
                <p className="text-[var(--text)] italic">&quot;{cognitiveDistortions[showDistortionInfo].example}&quot;</p>
              </div>
              <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
                <p className="text-sm text-[var(--text-light)] mb-1">Challenge it:</p>
                <p className="text-[var(--text)]">{cognitiveDistortions[showDistortionInfo].challenge}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // Main tools list view
  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[var(--bg)] to-[var(--card)]">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 pb-5"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center shadow-lg"
            >
              <Brain className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">CBT Tools</h1>
              <p className="text-sm text-[var(--text-muted)]">Evidence-based exercises</p>
            </div>
          </div>
        </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <div className="bg-gradient-to-br from-[var(--primary)]/10 to-emerald-500/10 rounded-2xl p-5 border border-[var(--border)] backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--text)]">{completedExercises.length}</p>
          <p className="text-sm text-[var(--text-muted)]">Exercises Done</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-[var(--border)] backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-[var(--text)]">{cbtExercises.length}</p>
          <p className="text-sm text-[var(--text-muted)]">Available</p>
        </div>
      </motion.div>

      {/* Exercise List */}
      <div className="space-y-3">
        <h2 className="font-semibold text-[var(--text)] mb-3">Exercises</h2>
        
        {cbtExercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          const Icon = exercise.type === 'thought_record' ? Brain :
                      exercise.type === 'mindful_breathing' ? Wind :
                      exercise.type === 'gratitude_practice' ? Heart :
                      exercise.type === 'progressive_relaxation' ? Sparkles :
                      Target;

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  isCompleted && "border-[var(--primary)]/30 bg-[var(--primary)]/5"
                )}
                onClick={() => startExercise(exercise)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isCompleted ? "bg-[var(--primary)]/20" : "bg-[var(--bg-alt)]"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        isCompleted ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text)]">{exercise.title}</h3>
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] mt-1">{exercise.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-[var(--text-light)]">
                          <Clock className="w-3 h-3" />
                          {exercise.duration} min
                        </span>
                        <span className="text-xs text-[var(--text-light)]">
                          {exercise.steps.length} steps
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-light)]" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-100 dark:border-purple-900">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-purple-500 dark:text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-300">What is CBT?</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  Cognitive Behavioral Therapy helps you identify and change negative thought patterns. 
                  These exercises are based on proven techniques used by therapists worldwide.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}
