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
  deleteDoc,
} from "firebase/firestore";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useEffect, useState, useMemo, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiHeart,
  FiBookmark,
  FiShare2,
  FiEye,
  FiTrash2,
  FiMessageCircle,
  FiCornerDownRight,
  FiSend,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { HiTrendingUp } from "react-icons/hi";

// ─────────────────────────────────────────────
// COUNTRY UTILS
// ─────────────────────────────────────────────
const COUNTRY_CODES = {
  nigeria: "NG",
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  canada: "CA",
  india: "IN",
  germany: "DE",
  france: "FR",
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  belgium: "BE",
  switzerland: "CH",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  poland: "PL",
  russia: "RU",
  ukraine: "UA",
  japan: "JP",
  china: "CN",
  "south korea": "KR",
  australia: "AU",
  "new zealand": "NZ",
  brazil: "BR",
  mexico: "MX",
  argentina: "AR",
  "south africa": "ZA",
  egypt: "EG",
  kenya: "KE",
  ghana: "GH",
  singapore: "SG",
  malaysia: "MY",
  thailand: "TH",
  vietnam: "VN",
  philippines: "PH",
  indonesia: "ID",
  pakistan: "PK",
  bangladesh: "BD",
  turkey: "TR",
  "saudi arabia": "SA",
  uae: "AE",
  "united arab emirates": "AE",
  israel: "IL",
  greece: "GR",
  portugal: "PT",
  ireland: "IE",
  austria: "AT",
  "czech republic": "CZ",
  czechia: "CZ",
  hungary: "HU",
  romania: "RO",
  serbia: "RS",
  croatia: "HR",
  slovenia: "SI",
  chile: "CL",
  colombia: "CO",
  peru: "PE",
  venezuela: "VE",
  ecuador: "EC",
  bolivia: "BO",
  paraguay: "PY",
  uruguay: "UY",
};

const toFlagEmoji = (code) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

const getCountryFlag = (name) => {
  if (!name || name === "Unknown") return String.fromCodePoint(0x1f30d);
  const n = name.trim().toLowerCase();
  if (/^[a-z]{2}$/i.test(n)) return toFlagEmoji(n);
  const code = COUNTRY_CODES[n];
  return code ? toFlagEmoji(code) : String.fromCodePoint(0x1f30d);
};

// ─────────────────────────────────────────────
// LAG-FREE INPUT COMPONENT
// Has its own local state so typing never re-renders the whole page.
// ─────────────────────────────────────────────
function CommentInputBox({ placeholder, onSubmit, autoFocus = false }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  };

  return (
    <div className="flex gap-2 flex-1 items-center">
      <input
        autoFocus={autoFocus}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSubmit}
        className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition flex-shrink-0"
      >
        <FiSend className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────
// RECURSIVE COMMENT NODE
// Renders one comment and all its descendants to infinite depth.
// allComments is the full flat array from Firestore.
// Each reply just has parentId pointing to its parent's id.
// ─────────────────────────────────────────────
function CommentNode({
  comment,
  allComments,
  depth,
  onAddReply,
  getRelativeTime,
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showChildren, setShowChildren] = useState(depth < 2);

  const children = allComments
    .filter((c) => c.parentId === comment.id)
    .sort((a, b) => a.createdAt - b.createdAt);

  const handleReply = (text) => {
    onAddReply(comment.id, text);
    setShowReplyInput(false);
    setShowChildren(true);
  };

  // Indent gets progressively smaller so deep threads don't blow out the layout
  const indent = Math.min(depth * 16, 48);

  return (
    <div style={{ marginLeft: indent }}>
      <div className="bg-background rounded-lg p-3 border border-border/40 space-y-1.5">
        {/* Author + text */}
        <div className="flex items-start gap-2">
          <img
            src={
              comment.authorImg ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author}`
            }
            className="w-6 h-6 rounded-full border border-border object-cover flex-shrink-0 mt-0.5"
            alt={comment.author}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-semibold text-foreground">
                {comment.author}
              </p>
              <span className="text-xs text-text-muted">
                {getRelativeTime(new Date(comment.createdAt))}
              </span>
            </div>
            <p className="text-sm text-foreground mt-0.5 break-words">
              {comment.text}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pl-8">
          <button
            onClick={() => setShowReplyInput((v) => !v)}
            className="text-xs text-text-muted hover:text-primary-500 flex items-center gap-1 transition"
          >
            <FiCornerDownRight className="w-3 h-3" />
            {showReplyInput ? "Cancel" : "Reply"}
          </button>

          {children.length > 0 && (
            <button
              onClick={() => setShowChildren((v) => !v)}
              className="text-xs text-primary-500 hover:underline flex items-center gap-1 transition"
            >
              {showChildren ? (
                <FiChevronUp className="w-3 h-3" />
              ) : (
                <FiChevronDown className="w-3 h-3" />
              )}
              {children.length} {children.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Inline reply input — its own state, zero lag */}
        <AnimatePresence>
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="pl-8 pt-1"
            >
              <CommentInputBox
                placeholder={`Reply to ${comment.author}…`}
                onSubmit={handleReply}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recursive children */}
      <AnimatePresence>
        {showChildren && children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {children.map((child) => (
              <CommentNode
                key={child.id}
                comment={child}
                allComments={allComments}
                depth={depth + 1}
                onAddReply={onAddReply}
                getRelativeTime={getRelativeTime}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN EXPLORE COMPONENT
// ─────────────────────────────────────────────
export default function Explore({ session }) {
  const userId = session?.user?.id || session?.user?.email || "anonymous";
  const userUsername =
    session?.user?.username || session?.user?.name || "Anonymous";
  const userImg = session?.user?.image || "";

  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [sortMode, setSortMode] = useState("recent");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [deletingPostId, setDeletingPostId] = useState(null);

  // Tracks which post IDs have already been registered as viewed this session.
  // Prevents duplicate Firestore writes when the component re-renders.
  const viewedThisSession = useRef(new Set());

  // Refs map: postId → DOM element, used by the IntersectionObserver
  const postRefs = useRef({});

  // ── Live Firestore feed ───────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bugPosts"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(data);
    });
    return () => unsub();
  }, []);

  // ── Helpers ───────────────────────────────────
  const getDateObj = (ts) => {
    if (!ts) return null;
    if (typeof ts === "object" && ts.toDate) return ts.toDate();
    if (typeof ts === "number") return new Date(ts);
    if (typeof ts === "string") {
      const n = Number(ts);
      return isNaN(n) ? null : new Date(n);
    }
    return null;
  };

  const getRelativeTime = (dateObj) => {
    if (!dateObj) return "Just now";
    const s = Math.floor((Date.now() - dateObj) / 1000);
    if (s < 60) return "Just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return dateObj.toLocaleDateString();
  };

  const getTrendingScore = (post) => {
    const likes = post.likedBy?.length || 0;
    const saves = post.savedBy?.length || 0;
    const shares = post.shares || 0;
    const views = post.viewedBy?.length || 0;
    const comments = post.comments?.length || 0;
    const dateObj = getDateObj(post.createdAt);
    const ageHours = dateObj
      ? (Date.now() - dateObj.getTime()) / 3_600_000
      : 9999;
    const boost = Math.max(0, 1 - ageHours / 72);
    return (
      (likes * 3 + saves * 2 + shares * 2 + comments * 2 + views * 0.5) *
      (1 + boost)
    );
  };

  // Post must have ≥5 unique views AND a meaningful engagement score to trend
  const isTrending = (post) =>
    (post.viewedBy?.length || 0) >= 5 && getTrendingScore(post) >= 5;

  // ── Dynamic hashtags ──────────────────────────
  const dynamicHashtags = useMemo(() => {
    const tagCount = {};
    posts.forEach((post) => {
      const fromField = [...(post.tags || []), ...(post.topics || [])];
      const fromText = [
        ...(post.title?.match(/#\w+/g) || []),
        ...(post.description?.match(/#\w+/g) || []),
      ].map((t) => t.slice(1));
      [...fromField, ...fromText].forEach((tag) => {
        if (!tag) return;
        const k = tag.toLowerCase().trim();
        tagCount[k] = (tagCount[k] || 0) + 1;
      });
    });
    const fromPosts = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t]) => t);
    return fromPosts.length >= 3
      ? fromPosts
      : ["react", "bug", "performance", "security", "ui/ux"];
  }, [posts]);

  // ── Filtered + sorted posts ───────────────────
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (showSavedOnly)
      result = result.filter((p) => p.savedBy?.includes(userId));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.author?.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (p.topics || []).some((t) => t.toLowerCase().includes(q)) ||
          p.title
            ?.match(/#\w+/g)
            ?.some((t) => t.slice(1).toLowerCase().includes(q)) ||
          p.description
            ?.match(/#\w+/g)
            ?.some((t) => t.slice(1).toLowerCase().includes(q)),
      );
    }

    if (topicFilter !== "all") {
      const f = topicFilter.toLowerCase();
      result = result.filter(
        (p) =>
          (p.tags || []).some((t) => t.toLowerCase() === f) ||
          (p.topics || []).some((t) => t.toLowerCase() === f) ||
          p.title?.toLowerCase().includes(f) ||
          p.description?.toLowerCase().includes(f),
      );
    }

    switch (sortMode) {
      case "trending":
        result.sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
        break;
      case "top":
        result.sort(
          (a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0),
        );
        break;
      case "viewed":
        result.sort(
          (a, b) => (b.viewedBy?.length || 0) - (a.viewedBy?.length || 0),
        );
        break;
      default:
        result.sort((a, b) => {
          const at = getDateObj(a.createdAt) || new Date(0);
          const bt = getDateObj(b.createdAt) || new Date(0);
          return bt - at;
        });
    }

    return result;
  }, [posts, searchQuery, topicFilter, sortMode, showSavedOnly, userId]);

  // ── View tracking via IntersectionObserver ────
  // A view is only counted when the post card enters the viewport and stays
  // visible for at least 1.5 s (avoids counting a rapid scroll-past).
  // viewedThisSession prevents duplicate writes on re-renders / re-filters.
  useEffect(() => {
    if (!filteredPosts.length) return;

    const timers = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.dataset.postId;
          if (!postId) return;

          if (entry.isIntersecting) {
            // Start a 1.5 s dwell timer
            timers[postId] = setTimeout(async () => {
              if (viewedThisSession.current.has(postId)) return;

              const post = filteredPosts.find((p) => p.id === postId);
              if (!post) return;

              // Only write to Firestore if this user hasn't viewed it before
              if (!post.viewedBy?.includes(userId)) {
                try {
                  await updateDoc(doc(db, "bugPosts", postId), {
                    viewedBy: arrayUnion(userId),
                  });
                } catch {}
              }

              // Mark as seen this session regardless, to stop further checks
              viewedThisSession.current.add(postId);
            }, 1500);
          } else {
            // User scrolled away before 1.5 s — cancel the timer
            clearTimeout(timers[postId]);
            delete timers[postId];
          }
        });
      },
      { threshold: 0.5 }, // at least 50% of the card must be visible
    );

    // Observe every post card that's currently rendered
    Object.entries(postRefs.current).forEach(([, el]) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      Object.values(timers).forEach(clearTimeout);
    };
  }, [filteredPosts, userId]);

  // ── Like ──────────────────────────────────────
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
    } catch {
      toast.error("Failed to update like");
    }
  };

  // ── Save ──────────────────────────────────────
  const toggleSave = async (post) => {
    const ref = doc(db, "bugPosts", post.id);
    const saved = post.savedBy?.includes(userId);
    await updateDoc(ref, {
      savedBy: saved ? arrayRemove(userId) : arrayUnion(userId),
    });
    toast.success(saved ? "Unsaved" : "Saved 🔖");
  };

  // ── Share ─────────────────────────────────────
  const sharePost = async (post) => {
    const url = `${window.location.origin}/explore?post=${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.description, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
    await updateDoc(doc(db, "bugPosts", post.id), { shares: increment(1) });
  };

  // ── Delete ────────────────────────────────────
  const deletePost = async () => {
    if (!deleteModal.post) return;

    const post = deleteModal.post;

    setDeletingPostId(post.id);

    try {
      await deleteDoc(doc(db, "bugPosts", post.id));
      toast.success("Post deleted");
      setDeleteModal({ open: false, post: null });
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeletingPostId(null);
    }
  };
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    post: null,
  });

  // ── Add top-level comment ─────────────────────
  // FLAT STRUCTURE: every comment and reply lives in the same `comments` array.
  // Top-level comments:  parentId = null
  // Replies at any depth: parentId = id of the comment being replied to
  // This means arrayUnion works for all depths — no nested array rewrites.
  const addComment = async (postId, text) => {
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      parentId: null,
      authorId: userId,
      author: userUsername,
      authorImg: userImg,
      text,
      createdAt: Date.now(),
    };
    try {
      await updateDoc(doc(db, "bugPosts", postId), {
        comments: arrayUnion(entry),
      });
      toast.success("Comment added 💬");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  // ── Add reply at any depth ────────────────────
  const addReply = async (postId, parentId, text) => {
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      parentId,
      authorId: userId,
      author: userUsername,
      authorImg: userImg,
      text,
      createdAt: Date.now(),
    };
    try {
      await updateDoc(doc(db, "bugPosts", postId), {
        comments: arrayUnion(entry),
      });
      toast.success("Reply added ↩️");
    } catch {
      toast.error("Failed to add reply");
    }
  };

  const toggleComments = (postId) =>
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-center" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto">
        {/* ── SIDEBAR ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Search Posts</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bugs, features, #tags..."
              className="w-full bg-background text-foreground placeholder-text-muted border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-primary-500 hover:underline flex items-center gap-1"
              >
                <FiX className="w-3 h-3" /> Clear search
              </button>
            )}
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Sort By</h3>
            <div className="space-y-2">
              {[
                { value: "recent", label: "Recent" },
                { value: "trending", label: "Trending" },
                { value: "top", label: "Most Liked" },
                { value: "viewed", label: "Most Viewed" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortMode(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sortMode === option.value
                      ? "bg-primary-500 text-white"
                      : "bg-background text-foreground hover:bg-surface"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
              showSavedOnly
                ? "bg-primary-500 text-white"
                : "bg-surface border border-border text-foreground hover:border-primary-500"
            }`}
          >
            {showSavedOnly ? "✓ Showing Saved" : "View Saved Posts"}
          </motion.button>

          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <HiTrendingUp className="text-primary-500" />
              Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTopicFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  topicFilter === "all"
                    ? "bg-primary-500 text-white"
                    : "bg-background text-foreground border border-border hover:border-primary-500"
                }`}
              >
                All
              </button>
              {dynamicHashtags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setTopicFilter(topicFilter === tag ? "all" : tag)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    topicFilter === tag
                      ? "bg-primary-500 text-white"
                      : "bg-background text-foreground border border-border hover:border-primary-500"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN FEED ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <h1 className="text-2xl font-bold text-foreground">Bug Feed</h1>
            <p className="text-text-muted text-sm">
              {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
              {topicFilter !== "all" && ` in #${topicFilter}`} • Discover real
              bugs and solutions
            </p>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredPosts.map((post, idx) => {
                  const liked = post.likedBy?.includes(userId);
                  const saved = post.savedBy?.includes(userId);
                  const isOwner =
                    post.authorId === userId ||
                    post.authorEmail === userId ||
                    post.author === userUsername;
                  const dateObj = getDateObj(post.createdAt);
                  const relativeTime = getRelativeTime(dateObj);
                  const commentsExpanded = expandedComments[post.id];

                  // All entries in the flat comments array
                  const allComments = post.comments || [];
                  // Only top-level entries to seed the recursive tree
                  const topLevelComments = allComments
                    .filter((c) => !c.parentId)
                    .sort((a, b) => a.createdAt - b.createdAt);
                  const totalComments = allComments.length;

                  return (
                    <motion.div
                      key={post.id}
                      ref={(el) => {
                        postRefs.current[post.id] = el;
                      }}
                      data-post-id={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-surface border border-border rounded-lg p-5 space-y-4 hover:border-primary-500 transition"
                    >
                      {/* POST HEADER */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={
                              post.authorImg ||
                              `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}`
                            }
                            className="w-10 h-10 rounded-full border border-border object-cover flex-shrink-0"
                            alt={post.author}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground text-sm">
                                {post.author || "Anonymous"}
                              </p>
                              {isTrending(post) && (
                                <span className="bg-primary-500/20 text-primary-500 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                  <HiTrendingUp className="w-3 h-3" />
                                  Trending
                                </span>
                              )}
                            </div>
                            <p className="text-text-muted text-xs">
                              {getCountryFlag(post.country)} {post.country} •{" "}
                              {relativeTime}
                            </p>
                          </div>
                        </div>

                        {/* DELETE — own posts only */}
                        {isOwner && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteModal({ open: true, post })}
                            disabled={deletingPostId === post.id}
                            title="Delete post"
                            className="flex-shrink-0 ml-2 p-2 rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-40"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>

                      {/* POST CONTENT */}
                      <div className="space-y-2">
                        <h2 className="text-lg font-bold text-foreground">
                          {post.title}
                        </h2>
                        <div className="space-y-2">
                          <p className="text-sm line-clamp-3">
                            {post.description}
                          </p>

                          <Link href={`/post/${post.id}`}>
                            <button className="flex items-center gap-1 text-xs text-primary-500 hover:underline">
                              Read More <FiArrowRight className="w-3 h-3" />
                            </button>
                          </Link>
                        </div>
                        {(post.tags || post.topics) && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(post.tags || post.topics || []).map((tag) => (
                              <button
                                key={tag}
                                onClick={() =>
                                  setTopicFilter(tag.toLowerCase())
                                }
                                className="text-xs text-primary-500 hover:underline"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* STATS ROW */}
                      <div className="flex gap-4 text-xs text-text-muted pt-2 border-t border-border flex-wrap">
                        <span className="flex items-center gap-1">
                          <FiEye className="w-4 h-4" />
                          {post.viewedBy?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiHeart className="w-4 h-4" />
                          {post.likedBy?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiShare2 className="w-4 h-4" />
                          {post.shares || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMessageCircle className="w-4 h-4" />
                          {totalComments}
                        </span>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleLike(post)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                            liked
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              : "bg-background text-foreground hover:bg-surface"
                          }`}
                        >
                          {liked ? (
                            <AiFillHeart className="w-4 h-4" />
                          ) : (
                            <FiHeart className="w-4 h-4" />
                          )}
                          Like
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSave(post)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                            saved
                              ? "bg-primary-500/20 text-primary-500 hover:bg-primary-500/30"
                              : "bg-background text-foreground hover:bg-surface"
                          }`}
                        >
                          <FiBookmark className="w-4 h-4" />
                          Save
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => sharePost(post)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-background text-foreground hover:bg-surface font-semibold text-sm transition"
                        >
                          <FiShare2 className="w-4 h-4" />
                          Share
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleComments(post.id)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                            commentsExpanded
                              ? "bg-primary-500/20 text-primary-500"
                              : "bg-background text-foreground hover:bg-surface"
                          }`}
                        >
                          <FiMessageCircle className="w-4 h-4" />
                          {totalComments > 0 ? totalComments : "Comment"}
                        </motion.button>
                      </div>

                      {/* COMMENT SECTION */}
                      <AnimatePresence>
                        {commentsExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 space-y-3">
                              {/* Recursive thread */}
                              {topLevelComments.length > 0 ? (
                                <div className="space-y-2">
                                  {topLevelComments.map((comment) => (
                                    <CommentNode
                                      key={comment.id}
                                      comment={comment}
                                      allComments={allComments}
                                      depth={0}
                                      onAddReply={(parentId, text) =>
                                        addReply(post.id, parentId, text)
                                      }
                                      getRelativeTime={getRelativeTime}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-text-muted text-center py-2">
                                  No comments yet. Be the first!
                                </p>
                              )}

                              {/* New top-level comment — isolated state, no lag */}
                              <div className="flex gap-2 items-center pt-1">
                                <img
                                  src={
                                    userImg ||
                                    `https://api.dicebear.com/7.x/identicon/svg?seed=${userUsername}`
                                  }
                                  className="w-8 h-8 rounded-full border border-border object-cover flex-shrink-0"
                                  alt="You"
                                />
                                <CommentInputBox
                                  placeholder="Write a comment…"
                                  onSubmit={(text) => addComment(post.id, text)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-lg p-12 text-center space-y-3">
              <p className="text-text-muted">
                {searchQuery || topicFilter !== "all"
                  ? "No posts match your filters. Try a different search."
                  : "No posts found. Check back later!"}
              </p>
              {(searchQuery || topicFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setTopicFilter("all");
                  }}
                  className="text-sm text-primary-500 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, post: null })}
        PaperProps={{
          sx: {
            backgroundColor: "var(--surface)",
            color: "var(--foreground)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            minWidth: "320px",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Post</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
            This action cannot be undone. Are you sure you want to delete this
            post?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteModal({ open: false, post: null })}
            sx={{
              textTransform: "none",
              color: "var(--text-muted)",
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={deletePost}
            disabled={deletingPostId === deleteModal.post?.id}
            sx={{
              textTransform: "none",
              backgroundColor: "rgba(239,68,68,0.15)",
              color: "#f87171",
              "&:hover": {
                backgroundColor: "rgba(239,68,68,0.25)",
              },
            }}
          >
            {deletingPostId === deleteModal.post?.id ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
