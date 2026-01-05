"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, BookOpen, Video, FileText, Lightbulb, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SharedResource } from "@/lib/community-learning-engine";

interface SharedResourceCardProps {
  resource: SharedResource;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  delay?: number;
}

export function SharedResourceCard({
  resource,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  delay = 0,
}: SharedResourceCardProps) {
  const typeIcons = {
    article: BookOpen,
    video: Video,
    exercise: Lightbulb,
    guide: FileText,
    discussion: MessageSquare,
  };

  const typeColors = {
    article: "bg-blue-100 text-blue-700",
    video: "bg-red-100 text-red-700",
    exercise: "bg-green-100 text-green-700",
    guide: "bg-purple-100 text-purple-700",
    discussion: "bg-amber-100 text-amber-700",
  };

  const TypeIcon = typeIcons[resource.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", typeColors[resource.type])}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sage-800 line-clamp-2">{resource.title}</h3>
              <p className="text-xs text-sage-500 mt-0.5">Shared by {resource.sharedBy}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-sage-600 mb-3 line-clamp-2">{resource.description}</p>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {resource.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-xs text-sage-500">+{resource.tags.length - 3} more</span>
              )}
            </div>
          )}

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-beige-100">
            <div className="flex items-center gap-3 text-xs text-sage-500">
              <span>{resource.likes} likes</span>
              <span>{resource.comments} comments</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onLike}
                className={cn("h-8 w-8 p-0", isLiked && "text-red-500")}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onComment}
                className="h-8 w-8 p-0"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onShare}
                className="h-8 w-8 p-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
