"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Heart, MessageCircle, ExternalLink, Shield } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const crisisResources = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 crisis support",
    country: "USA"
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    description: "Text-based crisis support",
    country: "USA"
  },
  {
    name: "Samaritans",
    phone: "116 123",
    description: "24/7 emotional support",
    country: "UK"
  },
  {
    name: "International Association for Suicide Prevention",
    phone: "Various",
    url: "https://www.iasp.info/resources/Crisis_Centres/",
    description: "Find help in your country",
    country: "International"
  }
];

const groundingExercises = [
  {
    name: "5-4-3-2-1 Grounding",
    steps: [
      "Name 5 things you can SEE",
      "Name 4 things you can TOUCH",
      "Name 3 things you can HEAR",
      "Name 2 things you can SMELL",
      "Name 1 thing you can TASTE"
    ]
  },
  {
    name: "Box Breathing",
    steps: [
      "Breathe IN for 4 seconds",
      "HOLD for 4 seconds",
      "Breathe OUT for 4 seconds",
      "HOLD for 4 seconds",
      "Repeat 4 times"
    ]
  }
];

export function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"resources" | "grounding">("resources");

  return (
    <>
      {/* Floating Emergency Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Emergency support"
      >
        <Shield className="w-5 h-5" />
      </motion.button>

      {/* Crisis Support Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crisis Support"
        description="You're not alone. Help is available."
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-beige-100 rounded-lg">
            <button
              onClick={() => setActiveTab("resources")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "resources"
                  ? "bg-white text-sage-800 shadow-sm"
                  : "text-sage-500 hover:text-sage-700"
              }`}
            >
              <Phone className="w-4 h-4 inline mr-1" />
              Helplines
            </button>
            <button
              onClick={() => setActiveTab("grounding")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "grounding"
                  ? "bg-white text-sage-800 shadow-sm"
                  : "text-sage-500 hover:text-sage-700"
              }`}
            >
              <Heart className="w-4 h-4 inline mr-1" />
              Grounding
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "resources" && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {crisisResources.map((resource, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sage-800">{resource.name}</h4>
                          <p className="text-sm text-sage-500">{resource.description}</p>
                          <p className="text-xs text-sage-400 mt-1">{resource.country}</p>
                        </div>
                        {resource.url ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-sage-100 hover:bg-sage-200 rounded-full transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-sage-600" />
                          </a>
                        ) : (
                          <a
                            href={`tel:${resource.phone.replace(/\D/g, '')}`}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                          >
                            <Phone className="w-4 h-4 text-red-600" />
                          </a>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-sage-700 mt-2">
                        {resource.phone}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}

            {activeTab === "grounding" && (
              <motion.div
                key="grounding"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <p className="text-sm text-sage-600">
                  These exercises can help you feel more grounded in the present moment.
                </p>
                
                {groundingExercises.map((exercise, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sage-800 mb-3">{exercise.name}</h4>
                      <ol className="space-y-2">
                        {exercise.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-sage-100 text-sage-600 text-xs flex items-center justify-center font-medium">
                              {stepIndex + 1}
                            </span>
                            <span className="text-sm text-sage-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Supportive Message */}
          <div className="p-4 bg-sage-50 rounded-lg text-center">
            <Heart className="w-6 h-6 text-sage-500 mx-auto mb-2" />
            <p className="text-sm text-sage-700">
              You matter. Whatever you're going through, there are people who want to help.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
