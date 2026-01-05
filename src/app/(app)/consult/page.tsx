"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Phone, MessageSquare, Calendar, Star, Clock, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type ProfessionalType = "therapist" | "lawyer" | "doctor";
type ConsultationType = "video" | "voice" | "chat";

interface Professional {
  id: string;
  name: string;
  type: ProfessionalType;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  availability: string;
  price: string;
  avatar: string;
  bio: string;
}

const professionals: Professional[] = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    type: "therapist",
    specialty: "Anxiety & Depression",
    rating: 4.9,
    reviews: 127,
    experience: "12 years",
    availability: "Available today",
    price: "$80/session",
    avatar: "sarah",
    bio: "Specializing in cognitive behavioral therapy and mindfulness-based approaches.",
  },
  {
    id: "2",
    name: "Dr. James Chen",
    type: "doctor",
    specialty: "General Psychiatry",
    rating: 4.8,
    reviews: 89,
    experience: "15 years",
    availability: "Next available: Tomorrow",
    price: "$120/session",
    avatar: "james",
    bio: "Board-certified psychiatrist with expertise in medication management.",
  },
  {
    id: "3",
    name: "Emily Rodriguez, JD",
    type: "lawyer",
    specialty: "Mental Health Law",
    rating: 4.7,
    reviews: 56,
    experience: "8 years",
    availability: "Available today",
    price: "$150/hour",
    avatar: "emily",
    bio: "Specializing in patient rights, disability claims, and mental health advocacy.",
  },
  {
    id: "4",
    name: "Dr. Michael Park",
    type: "therapist",
    specialty: "Trauma & PTSD",
    rating: 4.9,
    reviews: 203,
    experience: "18 years",
    availability: "Available today",
    price: "$95/session",
    avatar: "michael",
    bio: "EMDR certified therapist specializing in trauma recovery and resilience building.",
  },
  {
    id: "5",
    name: "Dr. Lisa Thompson",
    type: "doctor",
    specialty: "Sleep Disorders",
    rating: 4.6,
    reviews: 72,
    experience: "10 years",
    availability: "Next available: Wed",
    price: "$100/session",
    avatar: "lisa",
    bio: "Expert in sleep medicine and its connection to mental wellness.",
  },
  {
    id: "6",
    name: "David Kim, JD",
    type: "lawyer",
    specialty: "Healthcare Rights",
    rating: 4.8,
    reviews: 41,
    experience: "6 years",
    availability: "Next available: Tomorrow",
    price: "$175/hour",
    avatar: "david",
    bio: "Focused on healthcare access, insurance disputes, and patient advocacy.",
  },
];

const typeLabels: Record<ProfessionalType, string> = {
  therapist: "Therapists",
  doctor: "Doctors",
  lawyer: "Legal Advisors",
};

const typeIcons: Record<ProfessionalType, string> = {
  therapist: "🧠",
  doctor: "⚕️",
  lawyer: "⚖️",
};

export default function ConsultPage() {
  const { isFullyUnlocked } = useFeatureGateStore();
  const { isDemoMode } = useAuthStore();
  const [selectedType, setSelectedType] = useState<ProfessionalType | "all">("all");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedConsultType, setSelectedConsultType] = useState<ConsultationType>("video");

  const showPage = isFullyUnlocked || isDemoMode;

  if (!showPage) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-sage-600">
              Complete 10 chat sessions to unlock professional consultations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredProfessionals = selectedType === "all" 
    ? professionals 
    : professionals.filter(p => p.type === selectedType);

  const handleBookConsultation = () => {
    setShowBookingModal(false);
    setSelectedProfessional(null);
    // In a real app, this would initiate the booking process
    alert("Demo: Consultation booked! You would receive a confirmation email.");
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-sage-800">Professional Support</h1>
        <p className="text-sage-600">Connect with licensed professionals</p>
      </motion.div>

      {/* Trust Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-sage-100 to-soft-blue-100 border-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-sage-600" />
              <div>
                <p className="font-medium text-sage-800">Verified Professionals</p>
                <p className="text-sm text-sage-600">All consultants are licensed and background-checked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        <Button
          variant={selectedType === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedType("all")}
        >
          All
        </Button>
        {(Object.keys(typeLabels) as ProfessionalType[]).map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedType(type)}
          >
            {typeIcons[type]} {typeLabels[type]}
          </Button>
        ))}
      </motion.div>

      {/* Professionals List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredProfessionals.map((professional, index) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedProfessional(professional)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar seed={professional.avatar} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sage-800">{professional.name}</h3>
                          <p className="text-sm text-sage-600">{professional.specialty}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-sage-100 text-sage-700 rounded-full">
                          {typeIcons[professional.type]}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="w-4 h-4 fill-current" />
                          {professional.rating}
                        </span>
                        <span className="text-sage-500">({professional.reviews} reviews)</span>
                        <span className="text-sage-500">{professional.experience}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          professional.availability.includes("today") 
                            ? "bg-green-100 text-green-700"
                            : "bg-beige-100 text-sage-600"
                        )}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {professional.availability}
                        </span>
                        <span className="font-medium text-sage-700">{professional.price}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-sage-400 self-center" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Professional Detail Modal */}
      <Modal
        isOpen={!!selectedProfessional && !showBookingModal}
        onClose={() => setSelectedProfessional(null)}
        title={selectedProfessional?.name || ""}
      >
        {selectedProfessional && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar seed={selectedProfessional.avatar} size="xl" />
              <div>
                <p className="text-sage-600">{selectedProfessional.specialty}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="font-medium">{selectedProfessional.rating}</span>
                  <span className="text-sage-500">({selectedProfessional.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-sage-700">{selectedProfessional.bio}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-beige-50 rounded-lg">
                <p className="text-sage-500">Experience</p>
                <p className="font-medium text-sage-800">{selectedProfessional.experience}</p>
              </div>
              <div className="p-3 bg-beige-50 rounded-lg">
                <p className="text-sage-500">Rate</p>
                <p className="font-medium text-sage-800">{selectedProfessional.price}</p>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => setShowBookingModal(true)}
            >
              Book Consultation
            </Button>
          </div>
        )}
      </Modal>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Choose Consultation Type"
      >
        <div className="space-y-4">
          <p className="text-sage-600">How would you like to connect with {selectedProfessional?.name}?</p>
          
          <div className="space-y-3">
            {[
              { type: "video" as ConsultationType, icon: Video, label: "Video Call", desc: "Face-to-face consultation" },
              { type: "voice" as ConsultationType, icon: Phone, label: "Voice Call", desc: "Audio-only consultation" },
              { type: "chat" as ConsultationType, icon: MessageSquare, label: "Text Chat", desc: "Message-based consultation" },
            ].map(({ type, icon: Icon, label, desc }) => (
              <button
                key={type}
                onClick={() => setSelectedConsultType(type)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4",
                  selectedConsultType === type
                    ? "border-sage-500 bg-sage-50"
                    : "border-beige-200 hover:border-sage-300"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  selectedConsultType === type ? "bg-sage-500 text-white" : "bg-beige-100 text-sage-600"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-sage-800">{label}</p>
                  <p className="text-sm text-sage-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <Button className="w-full" onClick={handleBookConsultation}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule {selectedConsultType === "video" ? "Video" : selectedConsultType === "voice" ? "Voice" : "Chat"} Session
            </Button>
            <p className="text-xs text-center text-sage-500">
              You&apos;ll receive a confirmation with meeting details
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
