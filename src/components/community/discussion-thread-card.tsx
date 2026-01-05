"use client";

import { motion } from "framer-motion";
import { MessageSquare, Eye, Pin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { DiscussionThread } from "@/lib/community-learning-engine";

interface DiscussionThreadCardProps {
  thread: DiscussionThread;
  onClick?: () => void;
  delay?: number;
}

export function DiscussionThreadCard({
  thread,
  onClick,
  delay = 0,
}: DiscussionThreadCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-2">
            {thread.isPinned && (
              <Pin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-sage-800 line-clamp-2">{thread.title}</h3>
              <p className="text-xs text-sage-500 mt-0.5">Started by {thread.author}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-sage-600 mb-3 line-clamp-2">{thread.description}</p>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {thread.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
              {thread.tags.length > 2 && (
                <span className="text-xs text-sage-500">+{thread.tags.length - 2} more</span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-beige-100">
            <div className="flex items-center gap-4 text-xs text-sage-500">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{thread.replies} replies</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{thread.views} views</span>
              </div>
            </div>
            <div className="text-xs text-sage-400">
              {formatRelativeTime(thread.lastActivityAt)}
            </div>
          </div>

          {/* View Button */}
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 text-sage-600 hover:text-sage-800"
          >
            View Discussion
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
