"use client";

import { motion } from "framer-motion";
import { Users, Calendar, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LearningGroup } from "@/lib/community-learning-engine";

interface LearningGroupCardProps {
  group: LearningGroup;
  isJoined?: boolean;
  onJoin?: () => void;
  onClick?: () => void;
  delay?: number;
}

export function LearningGroupCard({
  group,
  isJoined = false,
  onJoin,
  onClick,
  delay = 0,
}: LearningGroupCardProps) {
  const levelColors = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-blue-100 text-blue-700",
    advanced: "bg-purple-100 text-purple-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-all h-full">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", group.color)}>
                {group.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sage-800 line-clamp-2">{group.name}</h3>
                <p className="text-xs text-sage-500 mt-0.5">{group.topic}</p>
              </div>
            </div>
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", levelColors[group.level])}>
              {group.level.charAt(0).toUpperCase() + group.level.slice(1)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-sage-600 mb-3 line-clamp-2">{group.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-3 mb-3 text-xs text-sage-500">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{group.members} members</span>
            </div>
            {group.nextSession && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Next session soon</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            size="sm"
            variant={isJoined ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.();
            }}
            className="w-full"
          >
            {isJoined ? "Joined" : "Join Group"}
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
