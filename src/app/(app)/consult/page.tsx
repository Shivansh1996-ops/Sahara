"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Phone, MessageCircle, Clock, Star, Calendar, Video, ArrowRight, X, Check, Mail, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Therapist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  sessions: number;
  available: boolean;
  image: string;
  bio: string;
  languages: string[];
  price: string;
}

const therapists: Therapist[] = [
  { 
    id: "1", 
    name: "Dr. Sarah Mitchell", 
    specialty: "Anxiety & Depression", 
    rating: 4.9, 
    sessions: 234, 
    available: true, 
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    bio: "Dr. Mitchell specializes in cognitive behavioral therapy and has 10+ years of experience helping individuals overcome anxiety and depression.",
    languages: ["English", "Spanish"],
    price: "$80/session"
  },
  { 
    id: "2", 
    name: "Dr. James Chen", 
    specialty: "Trauma & PTSD", 
    rating: 4.8, 
    sessions: 189, 
    available: true, 
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    bio: "Dr. Chen is a trauma specialist using EMDR and somatic experiencing to help clients heal from past experiences.",
    languages: ["English", "Mandarin"],
    price: "$90/session"
  },
  { 
    id: "3", 
    name: "Dr. Emily Rodriguez", 
    specialty: "Family Therapy", 
    rating: 4.9, 
    sessions: 312, 
    available: false, 
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    bio: "Dr. Rodriguez helps families navigate conflict, improve communication, and strengthen relationships through systemic therapy.",
    languages: ["English", "Portuguese"],
    price: "$100/session"
  },
];

const crisisResources = [
  { name: "National Suicide Prevention Lifeline", phone: "988", available: "24/7" },
  { name: "Crisis Text Line", phone: "Text HOME to 741741", available: "24/7" },
  { name: "SAMHSA National Helpline", phone: "1-800-662-4357", available: "24/7" },
];

export default function ConsultPage() {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{from: string; text: string}[]>([
    { from: "support", text: "Hello! I'm here to help. How can I assist you today?" }
  ]);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBookSession = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setShowBookingModal(true);
    setBookingConfirmed(false);
  };

  const confirmBooking = () => {
    if (!bookingDate || !bookingTime) return;
    setBookingConfirmed(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingDate("");
      setBookingTime("");
      showNotification(`Session booked with ${selectedTherapist?.name}! 📅`);
    }, 2000);
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    setChatMessages([...chatMessages, { from: "user", text: chatMessage }]);
    setChatMessage("");
    
    // Simulate response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        from: "support", 
        text: "Thank you for reaching out. A counselor will be with you shortly. In the meantime, please know that you're not alone, and help is available." 
      }]);
    }, 1500);
  };

  const availableSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

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

      {/* Crisis Modal */}
      <AnimatePresence>
        {showCrisisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[var(--accent)] flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Crisis Resources
                </h3>
                <button onClick={() => setShowCrisisModal(false)}><X className="w-5 h-5 text-[var(--text-light)]" /></button>
              </div>
              <p className="text-[var(--text-muted)] mb-4">If you&apos;re in immediate danger, please call emergency services (911) or use these resources:</p>
              <div className="space-y-3 mb-6">
                {crisisResources.map((resource) => (
                  <a 
                    key={resource.name}
                    href={`tel:${resource.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-[var(--accent)]" />
                    <div>
                      <p className="font-medium text-[var(--text)]">{resource.name}</p>
                      <p className="text-sm text-[var(--accent)] font-semibold">{resource.phone}</p>
                      <p className="text-xs text-[var(--text-light)]">{resource.available}</p>
                    </div>
                  </a>
                ))}
              </div>
              <Button onClick={() => setShowCrisisModal(false)} className="w-full bg-[var(--accent)] text-white rounded-xl h-12">
                I Understand
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Support Modal */}
      <AnimatePresence>
        {showChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl flex flex-col h-[500px]"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[var(--primary)]" /> Chat Support
                </h3>
                <button onClick={() => setShowChatModal(false)}><X className="w-5 h-5 text-[var(--text-light)]" /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("max-w-[80%] p-3 rounded-xl", msg.from === "user" ? "ml-auto bg-[var(--primary)] text-white" : "bg-[var(--bg-alt)] text-[var(--text)]")}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-[var(--border)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    className="flex-1 px-4 py-2 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <Button onClick={handleSendChat} className="bg-[var(--primary)] text-white rounded-full px-4">
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedTherapist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {!bookingConfirmed ? (
                <>
                  <div className="p-6 border-b border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-[var(--text)]">Book Session</h3>
                      <button onClick={() => setShowBookingModal(false)}><X className="w-5 h-5 text-[var(--text-light)]" /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative">
                        <Image src={selectedTherapist.image} alt={selectedTherapist.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)]">{selectedTherapist.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">{selectedTherapist.specialty}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[var(--text)] mb-2">Select Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[var(--text)] mb-2">Select Time</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setBookingTime(slot)}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm border transition-all",
                              bookingTime === slot 
                                ? "bg-[var(--primary)] text-white border-[var(--primary)]" 
                                : "border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]"
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[var(--bg-alt)] rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Session Fee</span>
                        <span className="font-semibold text-[var(--text)]">{selectedTherapist.price}</span>
                      </div>
                    </div>
                    <Button onClick={confirmBooking} disabled={!bookingDate || !bookingTime} className="w-full bg-[var(--primary)] text-white rounded-xl h-12">
                      <Calendar className="w-4 h-4 mr-2" /> Confirm Booking
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Booking Confirmed!</h3>
                  <p className="text-[var(--text-muted)] mb-4">
                    Your session with {selectedTherapist.name} is scheduled for<br />
                    <span className="font-semibold">{bookingDate} at {bookingTime}</span>
                  </p>
                  <p className="text-sm text-[var(--text-light)]">You&apos;ll receive a confirmation email shortly.</p>
                </div>
              )}
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
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] shadow-lg"
            >
              <Shield className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Consult</h1>
              <p className="text-sm text-[var(--text-muted)]">Professional mental health support</p>
            </div>
          </div>
        </motion.div>

        {/* Crisis Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl p-5 border border-red-100 dark:border-red-900 shadow-sm">
            <div className="flex items-center gap-4">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20"
              >
                <Shield className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h4 className="font-bold text-[var(--accent)] text-lg">In Crisis?</h4>
                <p className="text-sm text-[var(--accent)]/80">Please seek immediate help if you&apos;re in danger.</p>
              </div>
              <Button onClick={() => setShowCrisisModal(true)} className="bg-gradient-to-r from-[var(--accent)] to-red-600 hover:opacity-90 text-white rounded-full shadow-lg shadow-red-500/20">
                <Phone className="w-4 h-4 mr-2" /> Get Help
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Resources */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { title: "Crisis Hotline", desc: "24/7 support", icon: Phone, color: "var(--accent)", action: () => setShowCrisisModal(true) },
            { title: "Chat Support", desc: "Text counseling", icon: MessageCircle, color: "var(--primary)", action: () => setShowChatModal(true) },
            { title: "Schedule", desc: "Book session", icon: Calendar, color: "#22c55e", action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
          ].map((resource, i) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={resource.action}
              className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: `color-mix(in srgb, ${resource.color} 15%, transparent)` }}>
                <resource.icon className="w-6 h-6" style={{ color: resource.color }} />
              </div>
              <h4 className="font-semibold text-[var(--text)] mb-1">{resource.title}</h4>
              <p className="text-sm text-[var(--text-light)]">{resource.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Therapists */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Available Therapists</h2>
          <div className="space-y-4">
            {therapists.map((therapist, i) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <Image src={therapist.image} alt={therapist.name} fill className="object-cover" />
                    </div>
                    {therapist.available && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--card)]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[var(--text)]">{therapist.name}</h4>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", therapist.available ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400")}>
                        {therapist.available ? "Available" : "Busy"}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mb-1">{therapist.specialty}</p>
                    <p className="text-xs text-[var(--text-light)] mb-2">{therapist.bio.slice(0, 80)}...</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{therapist.rating}</span>
                      </span>
                      <span className="text-[var(--text-light)]">{therapist.sessions} sessions</span>
                      <span className="text-[var(--primary)] font-medium">{therapist.price}</span>
                    </div>
                  </div>
                  {therapist.available && (
                    <Button onClick={() => handleBookSession(therapist)} className="bg-[var(--primary)] text-white rounded-full flex-shrink-0">
                      <Video className="w-4 h-4 mr-2" /> Book
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Promo */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">First Session Free</h4>
              <p className="text-white/80 text-sm">Try a 30-minute consultation at no cost</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
