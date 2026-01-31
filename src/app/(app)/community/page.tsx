"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, MessageCircle, Plus, ChevronRight, Palette, Music, Camera, Dumbbell, Send, X, Check, Share2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface Post {
  id: string;
  author: string;
  content: string;
  likes: number;
  time: string;
  avatar: string;
  replies: { author: string; content: string; avatar: string }[];
}

interface Group {
  id: string;
  name: string;
  members: number;
  desc: string;
  joined: boolean;
  image: string;
}

interface Hobby {
  id: string;
  name: string;
  members: number;
  icon: typeof Palette;
  image: string;
  description: string;
  skills: string[];
}

const initialHobbies: Hobby[] = [
  { id: "art", name: "Art & Drawing", members: 234, icon: Palette, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop", description: "Express yourself through visual art. From sketching to digital painting.", skills: ["Sketching", "Watercolor", "Digital Art", "Portrait Drawing"] },
  { id: "music", name: "Music & Sound", members: 189, icon: Music, image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop", description: "Discover the joy of making music. Learn instruments, production, or just listen.", skills: ["Guitar", "Piano", "Singing", "Music Production"] },
  { id: "photography", name: "Photography", members: 156, icon: Camera, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop", description: "Capture moments and tell stories through your lens.", skills: ["Portrait", "Landscape", "Street Photography", "Editing"] },
  { id: "fitness", name: "Fitness & Yoga", members: 312, icon: Dumbbell, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop", description: "Build strength, flexibility, and mindfulness through movement.", skills: ["Yoga", "Meditation", "Strength Training", "Running"] },
];

const initialGroups: Group[] = [
  { id: "1", name: "Mindfulness Beginners", members: 45, desc: "Learn meditation basics together", joined: false, image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop" },
  { id: "2", name: "Anxiety Support", members: 78, desc: "Share experiences and coping strategies", joined: false, image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop" },
  { id: "3", name: "Creative Expression", members: 32, desc: "Express yourself through art", joined: false, image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=100&h=100&fit=crop" },
];

const initialPosts: Post[] = [
  { id: "1", author: "Sarah M.", content: "Just completed my first week of daily meditation! Feeling so much calmer. 🧘‍♀️", likes: 24, time: "2h ago", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", replies: [] },
  { id: "2", author: "James K.", content: "Discovered painting as stress relief. Anyone else into art therapy? 🎨", likes: 18, time: "5h ago", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", replies: [] },
  { id: "3", author: "Emily R.", content: "Grateful for this community. You all inspire me every day! 💜", likes: 31, time: "1d ago", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", replies: [] },
];

export default function CommunityPage() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"feed" | "hobbies" | "groups">("feed");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      author: profile?.name || "You",
      content: newPostContent,
      likes: 0,
      time: "Just now",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      replies: [],
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent("");
    showNotification("Post shared successfully! 🎉");
  };

  const handleLikePost = (postId: string) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  const handleReply = (postId: string) => {
    if (!replyContent.trim()) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, {
            author: profile?.name || "You",
            content: replyContent,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          }]
        };
      }
      return post;
    }));
    
    setReplyContent("");
    setReplyingTo(null);
    showNotification("Reply posted! 💬");
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g
    ));
    const group = groups.find(g => g.id === groupId);
    showNotification(group?.joined ? `Left ${group.name}` : `Joined ${group?.name}! 🎊`);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      members: 1,
      desc: newGroupDesc || "A new community group",
      joined: true,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
    };
    
    setGroups([newGroup, ...groups]);
    setNewGroupName("");
    setNewGroupDesc("");
    setShowCreateGroup(false);
    showNotification("Group created successfully! 🚀");
  };

  const handleJoinHobby = (hobby: Hobby) => {
    setSelectedHobby(null);
    showNotification(`Joined ${hobby.name}! Welcome to the community! 🎨`);
  };

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

      {/* Hobby Detail Modal */}
      <AnimatePresence>
        {selectedHobby && (
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
              <div className="relative h-48">
                <Image src={selectedHobby.image} alt={selectedHobby.name} fill className="object-cover" />
                <button onClick={() => setSelectedHobby(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                  <selectedHobby.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[var(--text)] mb-2">{selectedHobby.name}</h3>
                <p className="text-[var(--text-muted)] mb-4">{selectedHobby.description}</p>
                <p className="text-sm text-[var(--text-light)] mb-3">{selectedHobby.members} members</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedHobby.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-[var(--bg-alt)] text-[var(--primary)] text-sm rounded-full">{skill}</span>
                  ))}
                </div>
                <Button onClick={() => handleJoinHobby(selectedHobby)} className="w-full bg-[var(--primary)] text-white rounded-xl h-12">
                  Join Community
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
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
                <h3 className="text-xl font-semibold text-[var(--text)]">Create New Group</h3>
                <button onClick={() => setShowCreateGroup(false)}><X className="w-5 h-5 text-[var(--text-light)]" /></button>
              </div>
              <input
                type="text"
                placeholder="Group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] mb-3 focus:outline-none focus:border-[var(--primary)]"
              />
              <textarea
                placeholder="Description (optional)..."
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] mb-4 h-24 resize-none focus:outline-none focus:border-[var(--primary)]"
              />
              <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="w-full bg-[var(--primary)] text-white rounded-xl h-12">
                Create Group
              </Button>
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
          <div className="flex items-center gap-4 mb-1">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] shadow-lg"
            >
              <Users className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Community</h1>
              <p className="text-sm text-[var(--text-muted)]">Connect and discover hobbies</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] mb-5 shadow-sm">
          {[
            { id: "feed", label: "Feed", icon: MessageCircle },
            { id: "hobbies", label: "Hobbies", icon: Palette },
            { id: "groups", label: "Groups", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-md shadow-[var(--primary)]/20" 
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-alt)]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {/* New Post */}
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-lg flex-shrink-0">
                    {profile?.name?.[0]?.toUpperCase() || "😊"}
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Share something with the community..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full bg-[var(--bg-alt)] rounded-xl px-4 py-3 text-sm border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] resize-none h-20 text-[var(--text)]"
                    />
                    <div className="flex justify-end mt-2">
                      <Button onClick={handleCreatePost} disabled={!newPostContent.trim()} className="bg-[var(--primary)] text-white rounded-full px-5">
                        <Send className="w-4 h-4 mr-2" /> Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                      <Image src={post.avatar} alt={post.author} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-[var(--text)]">{post.author}</span>
                      <span className="text-[var(--text-light)] text-sm ml-2">{post.time}</span>
                    </div>
                  </div>
                  <p className="text-[var(--text-muted)] mb-4 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center gap-6 mb-3">
                    <button onClick={() => handleLikePost(post.id)} className={cn("flex items-center gap-2 transition-colors", likedPosts.includes(post.id) ? "text-[var(--accent)]" : "text-[var(--text-light)] hover:text-[var(--accent)]")}>
                      <Heart className={cn("w-5 h-5", likedPosts.includes(post.id) && "fill-current")} />
                      <span className="text-sm font-medium">{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                    </button>
                    <button onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)} className="flex items-center gap-2 text-[var(--text-light)] hover:text-[var(--primary)] transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Reply{post.replies.length > 0 && ` (${post.replies.length})`}</span>
                    </button>
                  </div>

                  {/* Replies */}
                  {post.replies.length > 0 && (
                    <div className="ml-6 pl-4 border-l-2 border-[var(--border)] space-y-3 mb-3">
                      {post.replies.map((reply, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden relative flex-shrink-0">
                            <Image src={reply.avatar} alt={reply.author} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[var(--text)]">{reply.author}</span>
                            <p className="text-sm text-[var(--text-muted)]">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <AnimatePresence>
                    {replyingTo === post.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text)]"
                          onKeyDown={(e) => e.key === "Enter" && handleReply(post.id)}
                        />
                        <Button onClick={() => handleReply(post.id)} disabled={!replyContent.trim()} size="sm" className="bg-[var(--primary)] text-white rounded-full">
                          <Send className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "hobbies" && (
            <motion.div key="hobbies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {initialHobbies.map((hobby, i) => (
                  <motion.div
                    key={hobby.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedHobby(hobby)}
                    className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)] hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <Image src={hobby.image} alt={hobby.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                        <hobby.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-[var(--text)] mb-1">{hobby.name}</h4>
                      <p className="text-sm text-[var(--text-light)]">{hobby.members} members</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "groups" && (
            <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {groups.map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                      <Image src={group.image} alt={group.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-[var(--text)]">{group.name}</h4>
                        {group.joined && <span className="text-xs bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">Joined</span>}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] mb-1">{group.desc}</p>
                      <p className="text-xs text-[var(--text-light)]">{group.members} members</p>
                    </div>
                    <Button onClick={() => handleJoinGroup(group.id)} className={cn("rounded-full", group.joined ? "bg-[var(--bg-alt)] text-[var(--primary)]" : "bg-[var(--primary)] text-white")}>
                      {group.joined ? "Leave" : "Join"}
                    </Button>
                  </div>
                </motion.div>
              ))}

              <Button onClick={() => setShowCreateGroup(true)} className="w-full bg-[var(--card)] text-[var(--primary)] hover:bg-[var(--bg-alt)] rounded-xl h-12 border-2 border-dashed border-[var(--primary)]/30">
                <Plus className="w-5 h-5 mr-2" /> Create New Group
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
