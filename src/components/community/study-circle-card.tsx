"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Users, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StudyCircle } from "@/lib/community-learning-engine";

interface StudyCircleCardProps {
  circle: StudyCircle;
  isJoined?: boolean;
  onJoin?: () => void;
  delay?: number;
}

export function StudyCircleCard({
  circle,
  isJoined = false,
  onJoin,
  delay = 0,
}: StudyCircleCardProps) {
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-700",
    ongoing: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };

  const isAvailable = circle.currentParticipants < circle.maxParticipants;
  const spotsLeft = circle.maxParticipants - circle.currentParticipants;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sage-800">{circle.title}</h3>
              <p className="text-xs text-sage-500 mt-0.5">Facilitated by {circle.facilitator}</p>
            </div>
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap", statusColors[circle.status])}>
              {circle.status.charAt(0).toUpperCase() + circle.status.slice(1)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-sage-600 mb-3 line-clamp-2">{circle.description}</p>

          {/* Details */}
          <div className="space-y-2 mb-3 text-xs text-sage-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-sage-400" />
              <span>{formatDate(circle.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sage-400" />
              <span>{circle.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-sage-400" />
              <span>
                {circle.currentParticipants}/{circle.maxParticipants} participants
                {isAvailable && <span className="text-green-600 ml-1">({spotsLeft} spots left)</span>}
              </span>
            </div>
            {circle.resources.length > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-sage-400" />
                <span>{circle.resources.length} resources</span>
              </div>
            )}
          </div>

          {/* Topic Tag */}
          <div className="mb-3">
            <span className="inline-block bg-sage-100 text-sage-700 text-xs px-2 py-1 rounded-full">
              {circle.topic}
            </span>
          </div>

          {/* Action Button */}
          <Button
            size="sm"
            variant={isJoined ? "outline" : "default"}
            disabled={!isAvailable && !isJoined && circle.status !== "completed"}
            onClick={onJoin}
            className="w-full"
          >
            {circle.status === "completed" ? "View Recording" : isJoined ? "Joined" : "Join Circle"}
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
