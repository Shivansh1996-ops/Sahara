"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Send, Users, MessageSquare, Sparkles, Heart, Globe } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Loading } from "@/components/ui/loading";
import { ConnectionGraph } from "@/components/community/connection-graph";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { formatRelativeTime, SUPPORTIVE_EMOJIS, cn } from "@/lib/utils";
import type { CommunityPost, SupportiveEmoji, PeerNode, PeerConnection } from "@/types";

// Demo data for connection graph
function getDemoGraphData(): { nodes: PeerNode[]; connections: PeerConnection[] } {
  const nodes: PeerNode[] = [
    { id: "demo-1", anonymousName: "GentleBreeze", avatarSeed: "breeze", connectionCount: 3 },
    { id: "demo-2", anonymousName: "CalmWaters", avatarSeed: "waters", connectionCount: 2 },
    { id: "demo-3", anonymousName: "SunnyMeadow", avatarSeed: "meadow", connectionCount: 4 },
    { id: "demo-4", anonymousName: "QuietForest", avatarSeed: "forest", connectionCount: 1 },
    { id: "demo-5", anonymousName: "WarmSunrise", avatarSeed: "sunrise", connectionCount: 2 },
    { id: "demo-6", anonymousName: "PeacefulRiver", avatarSeed: "river", connectionCount: 3 },
  ];
  const connections: PeerConnection[] = [
    { id: "c1", fromUserId: "demo-1", toUserId: "demo-2", createdAt: new Date() },
    { id: "c2", fromUserId: "demo-1", toUserId: "demo-3", createdAt: new Date() },
    { id: "c3", fromUserId: "demo-2", toUserId: "demo-5", createdAt: new Date() },
    { id: "c4", fromUserId: "demo-3", toUserId: "demo-4", createdAt: new Date() },
    { id: "c5", fromUserId: "demo-3", toUserId: "demo-6", createdAt: new Date() },
    { id: "c6", fromUserId: "demo-5", toUserId: "demo-6", createdAt: new Date() },
  ];
  return { nodes, connections };
}

export default function CommunityPage() {
  const { user, profile, isDemoMode: isAuthDemoMode } = useAuthStore();
  const { isFullyUnlocked } = useFeatureGateStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [peerNodes, setPeerNodes] = useState<PeerNode[]>([]);
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState<"graph" | "posts">("graph");

  const fetchPosts = useCallback(async () => {
    // Demo mode
    if (isDemoMode() || isAuthDemoMode) {
      const demoData = getDemoGraphData();
      setPeerNodes(demoData.nodes);
      setPeerConnections(demoData.connections);
      setPosts([
        {
          id: "demo-post-1",
          authorId: "demo-1",
          content: "Remember: every small step counts. You're doing amazing! 🌱",
          createdAt: new Date(Date.now() - 3600000),
          author: { anonymousName: "GentleBreeze" },
          reactions: [{ id: "r1", userId: "demo-2", emoji: "💚", postId: "demo-post-1", createdAt: new Date() }],
        },
        {
          id: "demo-post-2",
          authorId: "demo-3",
          content: "Sending positive vibes to everyone here. We're all in this together. ✨",
          createdAt: new Date(Date.now() - 7200000),
          author: { anonymousName: "SunnyMeadow" },
          reactions: [
            { id: "r2", userId: "demo-1", emoji: "🤗", postId: "demo-post-2", createdAt: new Date() },
            { id: "r3", userId: "demo-4", emoji: "💚", postId: "demo-post-2", createdAt: new Date() },
          ],
        },
      ]);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          *,
          author:user_profiles!community_posts_author_id_fkey(anonymous_name),
          reactions:post_reactions(*)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setPosts(
        data.map((post) => ({
          id: post.id,
          authorId: post.author_id,
          content: post.content,
          createdAt: new Date(post.created_at),
          author: post.author,
          reactions: post.reactions,
        }))
      );

      // Fetch peer nodes and connections
      const { data: profilesData } = await supabase
        .from("user_profiles")
        .select("user_id, anonymous_name")
        .not("anonymous_name", "is", null);

      const { data: connectionsData } = await supabase
        .from("peer_connections")
        .select("*");

      if (profilesData) {
        // Count connections per user
        const connectionCounts: Record<string, number> = {};
        connectionsData?.forEach((c) => {
          connectionCounts[c.from_user_id] = (connectionCounts[c.from_user_id] || 0) + 1;
          connectionCounts[c.to_user_id] = (connectionCounts[c.to_user_id] || 0) + 1;
        });

        setPeerNodes(
          profilesData.map((p) => ({
            id: p.user_id,
            anonymousName: p.anonymous_name || "Anonymous",
            avatarSeed: p.anonymous_name || p.user_id,
            connectionCount: connectionCounts[p.user_id] || 0,
          }))
        );
      }

      if (connectionsData) {
        setPeerConnections(
          connectionsData.map((c) => ({
            id: c.id,
            fromUserId: c.from_user_id,
            toUserId: c.to_user_id,
            createdAt: new Date(c.created_at),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // In demo mode, bypass unlock check
    if (isFullyUnlocked || isDemoMode() || isAuthDemoMode) {
      fetchPosts();
    } else {
      setIsLoading(false);
    }
  }, [isFullyUnlocked, fetchPosts, isAuthDemoMode]);

  // Bypass unlock check for demo mode
  const showCommunity = isFullyUnlocked || isDemoMode() || isAuthDemoMode;

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;

    setIsPosting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("community_posts").insert({
        author_id: user.id,
        content: newPostContent.trim(),
      });

      if (error) throw error;

      setNewPostContent("");
      setShowNewPostModal(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReaction = async (postId: string, emoji: SupportiveEmoji) => {
    if (!user) return;

    const supabase = createClient();

    try {
      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from("post_reactions")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from("post_reactions")
          .delete()
          .eq("id", existingReaction.id);
      } else {
        // Add reaction
        await supabase.from("post_reactions").insert({
          post_id: postId,
          user_id: user.id,
          emoji,
        });
      }

      fetchPosts();
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  if (!showCommunity) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-sage-600">
              Complete 10 chat sessions to unlock the community.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading community..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Community</h1>
          <p className="text-sage-600">Share encouragement, spread kindness</p>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2"
      >
        <Button
          variant={activeTab === "graph" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("graph")}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Connections
        </Button>
        <Button
          variant={activeTab === "posts" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("posts")}
          className="flex-1"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Posts
        </Button>
      </motion.div>

      {/* Connection Graph */}
      {activeTab === "graph" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-sage-600">
                Community Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectionGraph
                nodes={peerNodes}
                connections={peerConnections}
                currentUserId={user?.id}
                onNodeClick={(node) => console.log("Clicked node:", node)}
              />
              <p className="text-xs text-sage-500 mt-2 text-center">
                Drag nodes to explore • Click to view profile
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <>
          {/* New Post Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="soft"
              className="w-full justify-start"
              onClick={() => setShowNewPostModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Share something positive...
            </Button>
          </motion.div>

          {/* Posts Feed */}
          <div className="space-y-4">
            <AnimatePresence>
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onReaction={handleReaction}
                  delay={index * 0.05}
                />
              ))}
            </AnimatePresence>

            {posts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-sage-500">
                  Be the first to share something positive!
                </p>
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* New Post Modal */}
      <Modal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        title="Share Encouragement"
        description="Spread positivity in the community"
      >
        <div className="space-y-4">
          <Textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share something uplifting, encouraging, or kind..."
            className="min-h-[120px]"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-sage-500">
              {newPostContent.length}/500
            </span>
            <Button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
              isLoading={isPosting}
            >
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <p className="text-xs text-sage-500">
            Posting as {profile?.anonymousName || "Anonymous"}
          </p>
        </div>
      </Modal>
    </div>
  );
}

interface PostCardProps {
  post: CommunityPost;
  currentUserId?: string;
  onReaction: (postId: string, emoji: SupportiveEmoji) => void;
  delay: number;
}

function PostCard({ post, currentUserId, onReaction, delay }: PostCardProps) {
  const userReaction = post.reactions?.find((r) => r.userId === currentUserId);

  // Count reactions by emoji
  const reactionCounts = SUPPORTIVE_EMOJIS.reduce((acc, emoji) => {
    acc[emoji] = post.reactions?.filter((r) => r.emoji === emoji).length || 0;
    return acc;
  }, {} as Record<SupportiveEmoji, number>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar seed={post.author?.anonymousName || "user"} size="md" />
            <div>
              <p className="font-medium text-sage-800">
                {post.author?.anonymousName || "Anonymous"}
              </p>
              <p className="text-xs text-sage-500">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sage-700 whitespace-pre-wrap">{post.content}</p>

          {/* Reactions */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {SUPPORTIVE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReaction(post.id, emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors",
                  userReaction?.emoji === emoji
                    ? "bg-sage-200 text-sage-800"
                    : "bg-beige-100 text-sage-600 hover:bg-beige-200"
                )}
              >
                <span>{emoji}</span>
                {reactionCounts[emoji] > 0 && (
                  <span className="text-xs">{reactionCounts[emoji]}</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
