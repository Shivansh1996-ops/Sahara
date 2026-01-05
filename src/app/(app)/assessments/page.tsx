"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, ChevronRight, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Minus, ArrowLeft, X, Info, Calendar
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getAllAssessments,
  getAssessment,
  createAssessmentResult,
  analyzeAssessmentTrend,
  getRecommendedRetakeInterval,
  type Assessment,
  type AssessmentResult,
  type AssessmentType
} from "@/lib/assessment-engine";
import { cn } from "@/lib/utils";

export default function AssessmentsPage() {
  const { isDemoMode: isAuthDemoMode } = useAuthStore();
  const { isFullyUnlocked } = useFeatureGateStore();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [showResult, setShowResult] = useState<AssessmentResult | null>(null);

  // Load results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sahara-assessment-results");
    if (saved) {
      const parsed = JSON.parse(saved);
      setResults(parsed.map((r: AssessmentResult) => ({
        ...r,
        completedAt: new Date(r.completedAt)
      })));
    }
  }, []);

  const showAssessments = isFullyUnlocked || isAuthDemoMode;
  const assessments = getAllAssessments();

  const startAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < selectedAssessment!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Complete assessment
      const result = createAssessmentResult(selectedAssessment!.id, newAnswers);
      const updatedResults = [...results, result];
      setResults(updatedResults);
      localStorage.setItem("sahara-assessment-results", JSON.stringify(updatedResults));
      setShowResult(result);
      setSelectedAssessment(null);
    }
  };

  const closeAssessment = () => {
    setSelectedAssessment(null);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const getResultsForType = (type: AssessmentType): AssessmentResult[] => {
    return results.filter(r => r.assessmentType === type)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  };

  const getLastResult = (type: AssessmentType): AssessmentResult | undefined => {
    return getResultsForType(type)[0];
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'minimal': return 'text-green-600 bg-green-100';
      case 'mild': return 'text-yellow-600 bg-yellow-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'moderately_severe': return 'text-red-500 bg-red-100';
      case 'severe': return 'text-red-600 bg-red-100';
      default: return 'text-sage-600 bg-sage-100';
    }
  };

  if (!showAssessments) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <ClipboardList className="w-12 h-12 text-sage-300 mx-auto mb-3" />
            <p className="text-sage-600">
              Complete 10 chat sessions to unlock assessments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment in progress
  if (selectedAssessment) {
    const question = selectedAssessment.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedAssessment.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-beige-50 p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={closeAssessment} className="p-2 hover:bg-sage-100 rounded-full">
            <X className="w-5 h-5 text-sage-600" />
          </button>
          <h1 className="font-semibold text-sage-800">{selectedAssessment.name}</h1>
          <div className="w-9" />
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-sage-500 mb-2">
            <span>Question {currentQuestion + 1} of {selectedAssessment.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-sage-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-sage-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <p className="text-sage-500 text-sm mb-2">
                  Over the past {selectedAssessment.id === 'PSS' ? 'month' : 'two weeks'}...
                </p>
                <p className="text-lg text-sage-800 font-medium">{question.text}</p>
              </CardContent>
            </Card>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 bg-white rounded-xl border border-beige-200 hover:border-sage-400 hover:bg-sage-50 transition-all text-left"
                >
                  <span className="text-sage-700">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Disclaimer */}
        <p className="text-xs text-sage-400 text-center mt-6 px-4">
          {selectedAssessment.disclaimer}
        </p>
      </div>
    );
  }

  // Result view
  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-beige-50 p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-sage-600" />
            </div>
            <h1 className="text-xl font-bold text-sage-800">Assessment Complete</h1>
            <p className="text-sage-500">
              {getAssessment(showResult.assessmentType).name}
            </p>
          </div>

          {/* Score */}
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-5xl font-bold text-sage-800 mb-2">
                {showResult.score}
                <span className="text-2xl text-sage-400">/{showResult.maxScore}</span>
              </p>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium capitalize",
                getSeverityColor(showResult.severity)
              )}>
                {showResult.severity.replace('_', ' ')}
              </span>
            </CardContent>
          </Card>

          {/* Interpretation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-sage-600">
                What This Means
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sage-700">{showResult.interpretation}</p>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-sage-600">
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {showResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sage-700 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    This is a screening tool, not a diagnosis. If you're concerned about your 
                    mental health, please consult a healthcare provider.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setShowResult(null)} className="w-full">
            Done
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main assessments list
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-beige-50 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sage-500 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sage-800">Self-Assessments</h1>
            <p className="text-sm text-sage-500">Validated screening tools</p>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                These are screening tools only. They do not diagnose mental health conditions 
                and should not replace professional evaluation.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assessment List */}
      <div className="space-y-4">
        {assessments.map((assessment, index) => {
          const lastResult = getLastResult(assessment.id);
          const typeResults = getResultsForType(assessment.id);
          const trend = typeResults.length >= 2 ? analyzeAssessmentTrend(typeResults) : null;

          return (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sage-800">{assessment.name}</h3>
                      <p className="text-sm text-sage-500 mt-1">{assessment.purpose}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-sage-400">
                      <Clock className="w-3 h-3" />
                      {assessment.timeToComplete} min
                    </span>
                  </div>

                  {/* Last Result */}
                  {lastResult && (
                    <div className="p-3 bg-beige-50 rounded-lg mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-sage-500">Last Score</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-sage-700">
                              {lastResult.score}/{lastResult.maxScore}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs capitalize",
                              getSeverityColor(lastResult.severity)
                            )}>
                              {lastResult.severity.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        {trend && (
                          <div className="flex items-center gap-1">
                            {trend.trend === 'improving' && <TrendingDown className="w-4 h-4 text-green-500" />}
                            {trend.trend === 'worsening' && <TrendingUp className="w-4 h-4 text-red-500" />}
                            {trend.trend === 'stable' && <Minus className="w-4 h-4 text-sage-400" />}
                            <span className={cn(
                              "text-xs capitalize",
                              trend.trend === 'improving' ? 'text-green-600' :
                              trend.trend === 'worsening' ? 'text-red-600' : 'text-sage-500'
                            )}>
                              {trend.trend}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-sage-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(lastResult.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => startAssessment(assessment)}
                    className="w-full"
                    variant={lastResult ? "outline" : "default"}
                  >
                    {lastResult ? "Retake Assessment" : "Start Assessment"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Card className="bg-sage-50 border-sage-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-sage-700 mb-2">About These Assessments</h4>
            <ul className="text-sm text-sage-600 space-y-1">
              <li>• PHQ-9: Screens for depression symptoms</li>
              <li>• GAD-7: Screens for anxiety symptoms</li>
              <li>• PSS: Measures perceived stress levels</li>
            </ul>
            <p className="text-xs text-sage-500 mt-3">
              These are widely used, validated tools. Track your scores over time to 
              understand patterns in your mental wellness.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
