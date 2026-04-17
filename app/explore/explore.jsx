"use client";

import { db } from "@/config/firebase.config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

import {
  FiHeart,
  FiBookmark,
  FiShare2,
  FiCopy,
  FiMessageCircle,
  FiEye,
  FiThumbsDown,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { BsBookmarkFill } from "react-icons/bs";
import { HiTrendingUp } from "react-icons/hi";

export default function Explore() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "anonymous";
  const userUsername = session?.user?.username || "Anonymous";

  const [posts, setPosts] = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newComment, setNewComment] = useState({});
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [commentReplies, setCommentReplies] = useState({});

  // =========================
  // REALTIME FEED
  // =========================
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bugPosts"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(data);
    });

    return () => unsub();
  }, []);

  // =========================
  // SAFE TIMESTAMP PARSER
  // =========================
  const getDateObj = (timestamp) => {
    if (!timestamp) return null;

    // Firestore Timestamp
    if (typeof timestamp === "object") {
      return timestamp.toDate();
    }

    // number (ms)
    if (typeof timestamp === "number") {
      return new Date(timestamp);
    }

    // string fallback
    if (typeof timestamp === "string") {
      const parsed = Number(timestamp);
      return isNaN(parsed) ? null : new Date(parsed);
    }

    return null;
  };

  // =========================
  // FORMAT RELATIVE TIME
  // =========================
  const getRelativeTime = (dateObj) => {
    if (!dateObj) return "Just now";

    const now = new Date();
    const seconds = Math.floor((now - dateObj) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return "Older";
  };

  // =========================
  // GET COUNTRY FLAG
  // =========================
  const getCountryFlag = (countryName) => {
    if (!countryName || countryName === "Unknown") return "🌍";

    // Map of countries to their flag emojis
    const countryFlags = {
      Nigeria: "🇳🇬",
      "United States": "🇺🇸",
      USA: "🇺🇸",
      "United Kingdom": "🇬🇧",
      UK: "🇬🇧",
      Canada: "🇨🇦",
      India: "🇮🇳",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Spain: "🇪🇸",
      Italy: "🇮🇹",
      Netherlands: "🇳🇱",
      Belgium: "🇧🇪",
      Switzerland: "🇨🇭",
      Sweden: "🇸🇪",
      Norway: "🇳🇴",
      Denmark: "🇩🇰",
      Finland: "🇫🇮",
      Poland: "🇵🇱",
      Russia: "🇷🇺",
      Ukraine: "🇺🇦",
      Japan: "🇯🇵",
      China: "🇨🇳",
      "South Korea": "🇰🇷",
      Australia: "🇦🇺",
      "New Zealand": "🇳🇿",
      Brazil: "🇧🇷",
      Mexico: "🇲🇽",
      Argentina: "🇦🇷",
      "South Africa": "🇿🇦",
      Egypt: "🇪🇬",
      Kenya: "🇰🇪",
      Ghana: "🇬🇭",
      Singapore: "🇸🇬",
      Malaysia: "🇲🇾",
      Thailand: "🇹🇭",
      Vietnam: "🇻🇳",
      Philippines: "🇵🇭",
      Indonesia: "🇮🇩",
      Pakistan: "🇵🇰",
      Bangladesh: "🇧🇩",
      Turkey: "🇹🇷",
      "Saudi Arabia": "🇸🇦",
      UAE: "🇦🇪",
      "United Arab Emirates": "🇦🇪",
      Israel: "🇮🇱",
      Greece: "🇬🇷",
      Portugal: "🇵🇹",
      Ireland: "🇮🇪",
      Austria: "🇦🇹",
      "Czech Republic": "🇨🇿",
      Hungary: "🇭🇺",
      Romania: "🇷🇴",
      Serbia: "🇷🇸",
      Croatia: "🇭🇷",
      Slovenia: "🇸🇮",
      Chile: "🇨🇱",
      Colombia: "🇨🇴",
      Peru: "🇵🇪",
      Venezuela: "🇻🇪",
      Ecuador: "🇪🇨",
      Bolivia: "🇧🇴",
      Paraguay: "🇵🇾",
      Uruguay: "🇺🇾",
    };

    return countryFlags[countryName] || "🌍";
  };

  // =========================
  // LIKE
  // =========================
  const toggleLike = async (post) => {
    const ref = doc(db, "bugPosts", post.id);
    const liked = post.likedBy?.includes(userId);

    try {
      await updateDoc(ref, {
        likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
      });
      toast.success(liked ? "Unliked" : "Liked ❤️", {
        position: "bottom-center",
        duration: 1500,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  // =========================
  // SAVE
  // =========================
  const toggleSave = async (post) => {
    const ref = doc(db, "bugPosts", post.id);
    const saved = post.savedBy?.includes(userId);

    await updateDoc(ref, {
      savedBy: saved ? arrayRemove(userId) : arrayUnion(userId),
    });

    toast.success(saved ? "Unsaved" : "Saved 🔖");
  };

  // =========================
  // SHARE
  // =========================
  const sharePost = async (post) => {
    const url = `${window.location.origin}/explore?post=${post.id}`;

    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }

    await updateDoc(doc(db, "bugPosts", post.id), {
      shares: increment(1),
    });
  };

  // =========================
  // TRACK VIEWS
  // =========================
  const trackView = async (post) => {
    if (!post.viewedBy?.includes(userId)) {
      try {
        await updateDoc(doc(db, "bugPosts", post.id), {
          viewedBy: arrayUnion(userId),
        });
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    }
  };

  // =========================
  // CHECK IF TRENDING
  // =========================
  const isTrending = (post) => {
    const totalEngagement =
      (post.likedBy?.length || 0) +
      (post.savedBy?.length || 0) +
      (post.shares || 0);
    return totalEngagement >= 5; // Need at least 5 interactions to show trending
  };

  // =========================
  // ADD COMMENT
  // =========================
  const addComment = async (post, text) => {
    if (!text.trim()) return;

    try {
      const comment = {
        id: Date.now(),
        author: userUsername,
        authorId: userId,
        text,
        createdAt: Date.now(),
        likes: [],
        replies: [],
      };

      await updateDoc(doc(db, "bugPosts", post.id), {
        comments: arrayUnion(comment),
      });

      setNewComment({ ...newComment, [post.id]: "" });
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  // =========================
  // ADD REPLY TO COMMENT
  // =========================
  const addReplyToComment = async (post, commentId, text) => {
    if (!text.trim()) return;

    try {
      const reply = {
        id: Date.now(),
        author: userUsername,
        authorId: userId,
        text,
        createdAt: Date.now(),
        likes: [],
      };

      const updatedComments = post.comments.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c,
      );

      await updateDoc(doc(db, "bugPosts", post.id), {
        comments: updatedComments,
      });

      setCommentReplies({
        ...commentReplies,
        [commentId]: "",
      });
      toast.success("Reply added");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  // =========================
  // LIKE COMMENT
  // =========================
  const toggleCommentLike = async (post, commentId) => {
    const comment = post.comments?.find((c) => c.id === commentId);
    if (!comment) return;

    const liked = comment.likes?.includes(userId);

    try {
      const updatedComments = post.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: liked
                ? c.likes.filter((id) => id !== userId)
                : [...(c.likes || []), userId],
            }
          : c,
      );

      await updateDoc(doc(db, "bugPosts", post.id), {
        comments: updatedComments,
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // =========================
  // RANKING SYSTEM
  // =========================
  const rankedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
      const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
      return bTime - aTime; // Most recent first
    });
  }, [posts]);

  return (
    <main className="h-dvh overflow-y-scroll snap-y snap-mandatory bg-gradient-to-b from-[#050816] to-[#0f0f1e] text-white">
      <Toaster position="bottom-center" />

      {rankedPosts.map((post) => {
        trackView(post);

        const liked = post.likedBy?.includes(userId);
        const saved = post.savedBy?.includes(userId);

        const dateObj = getDateObj(post.createdAt);

        const relativeTime = getRelativeTime(dateObj);

        const date = dateObj
          ? dateObj.toLocaleDateString("en-NG", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Just now";

        const time = dateObj
          ? dateObj.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "";

        return (
          <section
            key={post.id}
            className="h-dvh snap-start flex items-center justify-center relative px-6 py-8 overflow-y-auto"
          >
            {/* CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 space-y-6 shadow-2xl hover:border-white/30 transition-all duration-300"
            >
              {/* AUTHOR */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      post.authorImg ||
                      "https://api.dicebear.com/7.x/identicon/svg?seed=user"
                    }
                    className="w-11 h-11 rounded-full border-2 border-emerald-400 object-cover"
                  />

                  <div>
                    <p className="text-white font-semibold text-sm">
                      {post.author || "Anonymous"}
                    </p>
                    <p className="text-gray-400 text-xs font-medium">
                      {getCountryFlag(post.country)} {post.country || "Unknown"}{" "}
                      • {post.language || "General"}
                    </p>
                  </div>
                </div>

                {/* DATE */}
                <div className="text-right">
                  <p className="text-white font-medium text-sm">
                    {relativeTime}
                  </p>
                  <p className="text-gray-500 text-xs">{time}</p>
                  <p className="text-gray-600 text-xs">{date}</p>
                </div>
              </div>

              {/* TREND - Only show if trending */}
              {isTrending(post) && (
                <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full w-fit">
                  <HiTrendingUp />
                  Trending Solution
                </div>
              )}

              {/* CONTENT */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  {post.title}
                </h1>

                <p className="text-gray-300 text-base leading-relaxed">
                  {post.description}
                </p>
              </div>

              {/* STATS */}
              <div className="flex gap-6 pt-4 border-t border-white/10 mt-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <FiEye className="text-blue-400" />
                  <span className="text-white font-semibold text-sm">
                    {post.viewedBy?.length || 0}
                  </span>
                  <span className="text-gray-400 text-xs">views</span>
                </div>
                <div className="flex items-center gap-2">
                  <AiFillHeart className="text-red-400" />
                  <span className="text-white font-semibold text-sm">
                    {post.likedBy?.length || 0}
                  </span>
                  <span className="text-gray-400 text-xs">likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsBookmarkFill className="text-emerald-400" />
                  <span className="text-white font-semibold text-sm">
                    {post.savedBy?.length || 0}
                  </span>
                  <span className="text-gray-400 text-xs">saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiShare2 className="text-blue-400" />
                  <span className="text-white font-semibold text-sm">
                    {post.shares || 0}
                  </span>
                  <span className="text-gray-400 text-xs">shares</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMessageCircle className="text-purple-400" />
                  <span className="text-white font-semibold text-sm">
                    {post.comments?.length || 0}
                  </span>
                  <span className="text-gray-400 text-xs">replies</span>
                </div>
              </div>

              {/* COMMENTS SECTION */}
              <div className="border-t border-white/10 pt-4 space-y-4 max-h-96 overflow-y-auto">
                {post.comments?.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    {/* MAIN COMMENT */}
                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm">
                            {comment.author}
                          </p>
                          {comment.authorId === post.authorId && (
                            <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-xs font-semibold">
                              OP
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs">
                          {getRelativeTime(getDateObj(comment.createdAt))}
                        </p>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.text}</p>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <button
                          onClick={() => toggleCommentLike(post, comment.id)}
                          className="hover:text-red-400 transition"
                        >
                          ❤️ {comment.likes?.length || 0}
                        </button>
                        <button
                          onClick={() =>
                            setExpandedCommentId(
                              expandedCommentId === comment.id
                                ? null
                                : comment.id,
                            )
                          }
                          className="hover:text-purple-400 transition"
                        >
                          💬 Reply
                        </button>
                      </div>

                      {/* REPLY INPUT */}
                      {expandedCommentId === comment.id && (
                        <div className="flex gap-2 bg-white/10 rounded p-2 mt-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={commentReplies[comment.id] || ""}
                            onChange={(e) =>
                              setCommentReplies({
                                ...commentReplies,
                                [comment.id]: e.target.value,
                              })
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                addReplyToComment(
                                  post,
                                  comment.id,
                                  commentReplies[comment.id],
                                );
                              }
                            }}
                            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
                          />
                          <button
                            onClick={() =>
                              addReplyToComment(
                                post,
                                comment.id,
                                commentReplies[comment.id],
                              )
                            }
                            className="text-emerald-400 hover:text-emerald-300 transition text-sm font-semibold"
                          >
                            Post
                          </button>
                        </div>
                      )}
                    </div>

                    {/* REPLIES */}
                    {comment.replies?.length > 0 && (
                      <div className="ml-4 space-y-2 border-l border-white/10 pl-3">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="bg-white/5 rounded-lg p-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-semibold text-xs">
                                  {reply.author}
                                </p>
                                {reply.authorId === post.authorId && (
                                  <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-xs font-semibold">
                                    OP
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs">
                                {getRelativeTime(getDateObj(reply.createdAt))}
                              </p>
                            </div>
                            <p className="text-gray-300 text-xs mt-1">
                              {reply.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* NEW COMMENT INPUT */}
                <div className="flex gap-2 bg-white/5 rounded-lg p-2 sticky bottom-0">
                  <input
                    type="text"
                    placeholder="Add a reply..."
                    value={newComment[post.id] || ""}
                    onChange={(e) =>
                      setNewComment({
                        ...newComment,
                        [post.id]: e.target.value,
                      })
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addComment(post, newComment[post.id]);
                      }
                    }}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
                  />
                  <button
                    onClick={() => addComment(post, newComment[post.id])}
                    className="text-emerald-400 hover:text-emerald-300 transition text-sm font-semibold"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ACTIONS */}
            <motion.div
              className="absolute right-6 flex flex-col gap-4 items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Like Button */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleLike(post)}
                className="flex flex-col items-center gap-1 p-3 rounded-full bg-white/10 hover:bg-red-500/20 transition-all duration-200"
              >
                {liked ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <AiFillHeart className="text-red-400 text-2xl" />
                  </motion.div>
                ) : (
                  <FiHeart className="text-2xl" />
                )}
                <span className="text-xs font-semibold text-gray-300">
                  {post.likedBy?.length || 0}
                </span>
              </motion.button>

              {/* Save Button */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleSave(post)}
                className="flex flex-col items-center gap-1 p-3 rounded-full bg-white/10 hover:bg-emerald-500/20 transition-all duration-200"
              >
                {saved ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <BsBookmarkFill className="text-emerald-400 text-xl" />
                  </motion.div>
                ) : (
                  <FiBookmark className="text-2xl" />
                )}
                <span className="text-xs font-semibold text-gray-300">
                  {post.savedBy?.length || 0}
                </span>
              </motion.button>

              {/* Share Button */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => sharePost(post)}
                className="flex flex-col items-center gap-1 p-3 rounded-full bg-white/10 hover:bg-blue-500/20 transition-all duration-200"
              >
                <FiShare2 className="text-2xl" />
                <span className="text-xs font-semibold text-gray-300">
                  {post.shares || 0}
                </span>
              </motion.button>

              {/* Copy Button */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => copyLink(post)}
                className="p-3 rounded-full bg-white/10 hover:bg-purple-500/20 transition-all duration-200"
              >
                <FiCopy className="text-2xl" />
              </motion.button>
            </motion.div>
          </section>
        );
      })}
    </main>
  );
}
