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
} from "@mui/material";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useEffect, useState, useMemo, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { formatLanguageLabel } from "@/Components/CodeSnippetBlock";
import GitHubBadge from "@/Components/GitHubBadge";
import BloggerBadge from "@/Components/BloggerBadge";
import { awardUserProgress } from "@/lib/client/gamification";

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
import { CiBookmark } from "react-icons/ci";
import { HiTrendingUp } from "react-icons/hi";

// ─────────────────────────────────────────────
// COUNTRY UTILS  (unchanged)
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
// LAG-FREE INPUT  (unchanged — already correct)
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
        className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSubmit}
        className="p-2.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition flex-shrink-0"
      >
        <FiSend className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMMENT NODE — Reddit-style thread lines
//
// BUG 1 FIX: children AnimatePresence was using
//   exit={{ opacity: 0, height: 0 }}
// Framer Motion cannot smoothly animate FROM height:"auto" on exit.
// It must first measure the current pixel height, which triggers a
// one-frame repaint at full height before collapsing → visible snap glitch.
//
// FIX: keep height:"auto" on enter for smooth expansion, but exit
// with opacity only. Height collapses naturally after the fade, which
// is invisible — no more snap.
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

  return (
    <div className="flex gap-3">
      {/* ── Left column: avatar + collapsible thread line (Reddit-style) ── */}
      <div
        className="flex flex-col items-center flex-shrink-0"
        style={{ width: 28 }}
      >
        <img
          src={
            comment.authorImg ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author}`
          }
          className="w-7 h-7 rounded-full border border-border object-cover flex-shrink-0"
          alt={comment.author}
        />
        {/* Thread continuation line — clicking collapses the branch */}
        {children.length > 0 && (
          <button
            onClick={() => setShowChildren((v) => !v)}
            className="mt-1.5 w-0.5 flex-1 bg-border hover:bg-primary-500/50 rounded-full transition-colors min-h-[20px] cursor-pointer"
            title={showChildren ? "Collapse thread" : "Expand thread"}
          />
        )}
      </div>

      {/* ── Right column: content + children ── */}
      <div className="flex-1 min-w-0 pb-1">
        {/* Header */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-xs font-bold text-foreground">
            {comment.author}
          </span>
          <GitHubBadge
            href={comment.authorGithubUrl}
            username={comment.authorGithubUsername}
            compact
          />
          <BloggerBadge visible={comment.authorIsBlogger} compact />
          <span className="text-[11px] text-text-muted">
            · {getRelativeTime(new Date(comment.createdAt))}
          </span>
        </div>

        {/* Text */}
        <p className="text-sm text-foreground/90 break-words leading-relaxed">
          {comment.text}
        </p>

        {/* Actions — compact, Reddit-style */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => setShowReplyInput((v) => !v)}
            className="text-[11px] font-semibold text-text-muted hover:text-primary-500 flex items-center gap-1 transition"
          >
            <FiCornerDownRight className="w-3 h-3" />
            {showReplyInput ? "Cancel" : "Reply"}
          </button>

          {children.length > 0 && !showChildren && (
            <button
              onClick={() => setShowChildren(true)}
              className="text-[11px] font-semibold text-primary-500 hover:underline flex items-center gap-1 transition"
            >
              <FiChevronDown className="w-3 h-3" />
              {children.length} more{" "}
              {children.length === 1 ? "reply" : "replies"}
            </button>
          )}

          {children.length > 0 && showChildren && (
            <button
              onClick={() => setShowChildren(false)}
              className="text-[11px] font-semibold text-text-muted hover:text-foreground flex items-center gap-1 transition"
            >
              <FiChevronUp className="w-3 h-3" />
              Collapse
            </button>
          )}
        </div>

        {/* Reply input — opacity+y only (no height animation needed here) */}
        <AnimatePresence>
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2.5"
            >
              <CommentInputBox
                placeholder={`Reply to ${comment.author}…`}
                onSubmit={handleReply}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CHILDREN — BUG 1 FIX ──
            Was: exit={{ opacity: 0, height: 0 }} → caused snap glitch
            Now: exit={{ opacity: 0 }} → fades out cleanly, height collapses
            naturally after unmount with no visible jump */}
        <AnimatePresence>
          {showChildren && children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-3 space-y-3 overflow-hidden"
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
  const userGithubUrl = session?.user?.githubProfileUrl || "";
  const userGithubUsername = session?.user?.githubUsername || "";
  const userProfileId = session?.user?.profileId || "";
  const userIsBlogger = Boolean(session?.user?.bloggerBadge);

  const [posts, setPosts] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [sortMode, setSortMode] = useState("recent");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, post: null });
  const [solveModal, setSolveModal] = useState({
    open: false,
    post: null,
    text: "",
  });
  const [solvingPostId, setSolvingPostId] = useState(null);

  const viewedThisSession = useRef(new Set());
  const postRefs = useRef({});

  const showAchievementToasts = (achievements) => {
    achievements.forEach((achievement) => {
      toast.success(`Achievement unlocked: ${achievement.title}`, {
        duration: 2500,
      });
    });
  };

  // ── Live Firestore feed ───────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bugPosts"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      setUserProfiles(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
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

  const leaderboard = useMemo(() => {
    return [...userProfiles]
      .map((profile) => {
        const stats = profile.stats || {};
        const score =
          (stats.postsCount || 0) * 3 +
          (stats.solutionsOfferedCount || 0) * 4 +
          (stats.solvedPostsCount || 0) * 5 +
          (stats.blogPostsCount || 0) * 3;

        return {
          id: profile.id,
          username: profile.username || profile.name || "Anonymous",
          score,
          bloggerBadge: Boolean(profile.bloggerBadge),
          achievements: profile.achievements || [],
        };
      })
      .filter((profile) => profile.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [userProfiles]);

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
          p.codeLanguage?.toLowerCase().includes(q) ||
          p.solutionText?.toLowerCase().includes(q) ||
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
  useEffect(() => {
    if (!filteredPosts.length) return;

    // BUG 4 FIX: clean up stale refs for posts no longer in the filtered list.
    // Without this, deleted or filtered-out posts keep entries in postRefs.current
    // forever, causing the observer to attach to detached DOM nodes.
    const activeIds = new Set(filteredPosts.map((p) => p.id));
    Object.keys(postRefs.current).forEach((id) => {
      if (!activeIds.has(id)) delete postRefs.current[id];
    });

    const timers = {};
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.dataset.postId;
          if (!postId) return;
          if (entry.isIntersecting) {
            timers[postId] = setTimeout(async () => {
              if (viewedThisSession.current.has(postId)) return;
              const post = filteredPosts.find((p) => p.id === postId);
              if (!post) return;
              if (!post.viewedBy?.includes(userId)) {
                try {
                  await updateDoc(doc(db, "bugPosts", postId), {
                    viewedBy: arrayUnion(userId),
                  });
                } catch {}
              }
              viewedThisSession.current.add(postId);
            }, 1500);
          } else {
            clearTimeout(timers[postId]);
            delete timers[postId];
          }
        });
      },
      { threshold: 0.5 },
    );

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

  // ── Comments ──────────────────────────────────
  const addComment = async (postId, text) => {
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      parentId: null,
      authorId: userId,
      author: userUsername,
      authorImg: userImg,
      authorGithubUrl: userGithubUrl,
      authorGithubUsername: userGithubUsername,
      authorIsBlogger: userIsBlogger,
      text,
      createdAt: Date.now(),
    };
    try {
      await updateDoc(doc(db, "bugPosts", postId), {
        comments: arrayUnion(entry),
      });
      const post = posts.find((item) => item.id === postId);
      if (post && post.authorId && post.authorId !== userId) {
        const achievements = await awardUserProgress(userProfileId, {
          solutionsOfferedCount: 1,
        });
        showAchievementToasts(achievements);
      }
      toast.success("Comment added 💬");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const addReply = async (postId, parentId, text) => {
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      parentId,
      authorId: userId,
      author: userUsername,
      authorImg: userImg,
      authorGithubUrl: userGithubUrl,
      authorGithubUsername: userGithubUsername,
      authorIsBlogger: userIsBlogger,
      text,
      createdAt: Date.now(),
    };
    try {
      await updateDoc(doc(db, "bugPosts", postId), {
        comments: arrayUnion(entry),
      });
      const post = posts.find((item) => item.id === postId);
      if (post && post.authorId && post.authorId !== userId) {
        const achievements = await awardUserProgress(userProfileId, {
          solutionsOfferedCount: 1,
        });
        showAchievementToasts(achievements);
      }
      toast.success("Reply added ↩️");
    } catch {
      toast.error("Failed to add reply");
    }
  };

  const toggleComments = (postId) =>
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const openSolveModal = (post) => {
    setSolveModal({
      open: true,
      post,
      text: post.solutionText || "",
    });
  };

  const closeSolveModal = () => {
    if (solvingPostId) return;
    setSolveModal({ open: false, post: null, text: "" });
  };

  const markPostSolved = async () => {
    if (!solveModal.post) return;

    setSolvingPostId(solveModal.post.id);

    try {
      await updateDoc(doc(db, "bugPosts", solveModal.post.id), {
        solved: true,
        solvedAt: Date.now(),
        solutionText: solveModal.text.trim(),
      });
      const achievements = await awardUserProgress(userProfileId, {
        solvedPostsCount: 1,
      });
      showAchievementToasts(achievements);
      toast.success("Marked as solved");
      setSolveModal({ open: false, post: null, text: "" });
    } catch {
      toast.error("Failed to mark post as solved");
    } finally {
      setSolvingPostId(null);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-center" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6 p-0 lg:p-6 max-w-7xl mx-auto">
        {/* ── SIDEBAR ─────────────────────────────── */}
        <aside className="lg:col-span-1 space-y-3 p-4 lg:p-0">
          {/* Search */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-foreground">Search</h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bugs, authors, #tags…"
                className="w-full bg-background text-foreground placeholder-text-muted border border-border rounded-xl pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-foreground">Sort by</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: "recent", label: "Recent" },
                { value: "trending", label: "Trending" },
                { value: "top", label: "Top liked" },
                { value: "viewed", label: "Most seen" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortMode(opt.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    sortMode === opt.value
                      ? "bg-primary-500 text-white"
                      : "bg-background text-text-muted hover:text-foreground border border-border"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saved toggle */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`w-full px-4 py-2.5 rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
              showSavedOnly
                ? "bg-primary-500 text-white"
                : "bg-surface border border-border text-foreground hover:border-primary-500"
            }`}
          >
            {showSavedOnly ? (
              <CiBookmark className="w-3.5 h-3.5" />
            ) : (
              <FiBookmark className="w-3.5 h-3.5" />
            )}
            {showSavedOnly ? "Showing saved" : "Saved posts"}
          </motion.button>

          <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              Leaderboard
            </h3>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {index + 1}. {entry.username}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <BloggerBadge visible={entry.bloggerBadge} compact />
                        <span className="text-[11px] text-text-muted">
                          {entry.achievements.length} achievements
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary-500">
                      {entry.score} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                Leaderboard will populate as the community earns achievements.
              </p>
            )}
          </div>

          {/* Trending topics */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <HiTrendingUp className="text-primary-500 w-4 h-4" />
              Trending topics
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setTopicFilter("all")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  topicFilter === "all"
                    ? "bg-primary-500 text-white"
                    : "bg-background text-text-muted border border-border hover:border-primary-500 hover:text-foreground"
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
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                    topicFilter === tag
                      ? "bg-primary-500 text-white"
                      : "bg-background text-text-muted border border-border hover:border-primary-500 hover:text-foreground"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN FEED ──────────────────────────────── */}
        <div className="lg:col-span-3">
          {/* Feed header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 lg:rounded-t-2xl lg:border lg:border-b-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-foreground">
                  Bug Feed
                </h1>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {filteredPosts.length} post
                  {filteredPosts.length !== 1 ? "s" : ""}
                  {searchQuery && ` · "${searchQuery}"`}
                  {topicFilter !== "all" && ` · #${topicFilter}`}
                </p>
              </div>
              {(searchQuery || topicFilter !== "all" || showSavedOnly) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setTopicFilter("all");
                    setShowSavedOnly(false);
                  }}
                  className="text-xs text-primary-500 hover:underline flex items-center gap-1"
                >
                  <FiX className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Posts */}
          {filteredPosts.length > 0 ? (
            <div className="border border-t-0 border-border lg:rounded-b-2xl overflow-hidden divide-y divide-border">
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
                  const allComments = post.comments || [];
                  const topLevelComments = allComments
                    .filter((c) => !c.parentId)
                    .sort((a, b) => a.createdAt - b.createdAt);
                  const totalComments = allComments.length;

                  return (
                    <motion.article
                      key={post.id}
                      ref={(el) => {
                        postRefs.current[post.id] = el;
                      }}
                      data-post-id={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -10 }}
                      // BUG 3 FIX: was delay: idx * 0.04 with no upper bound.
                      // For 50+ posts the last card had a 2s+ delay. Capped at 250ms.
                      transition={{
                        delay: Math.min(idx * 0.04, 0.25),
                        duration: 0.25,
                      }}
                      className="bg-background hover:bg-surface/50 transition-colors duration-150"
                    >
                      {/* X-style: two-column layout inside each post */}
                      <div className="px-4 pt-4 pb-3">
                        <div className="flex gap-3">
                          {/* Left: Avatar */}
                          <div className="flex-shrink-0">
                            <img
                              src={
                                post.authorImg ||
                                `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}`
                              }
                              className="w-10 h-10 rounded-full border border-border object-cover"
                              alt={post.author}
                            />
                          </div>

                          {/* Right: everything else */}
                          <div className="flex-1 min-w-0">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 min-w-0">
                                <span className="text-sm font-bold text-foreground truncate">
                                  {post.author || "Anonymous"}
                                </span>
                                <GitHubBadge
                                  href={post.authorGithubUrl}
                                  username={post.authorGithubUsername}
                                  compact
                                />
                                <BloggerBadge visible={post.authorIsBlogger} compact />
                                <span className="text-xs text-text-muted">
                                  {getCountryFlag(post.country)} {post.country}{" "}
                                  · {relativeTime}
                                </span>
                                {isTrending(post) && (
                                  <span className="inline-flex items-center gap-1 bg-primary-500/15 text-primary-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-500/20 flex-shrink-0">
                                    <HiTrendingUp className="w-3 h-3" />
                                    Hot
                                  </span>
                                )}
                                {post.solved && (
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">
                                    Solved
                                  </span>
                                )}
                              </div>
                              {isOwner && (
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    setDeleteModal({ open: true, post })
                                  }
                                  disabled={deletingPostId === post.id}
                                  className="flex-shrink-0 p-1.5 rounded-full text-text-muted hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-40"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              )}
                            </div>

                            {/* Title */}
                            <h2 className="text-sm font-bold text-foreground leading-snug">
                              {post.title}
                            </h2>

                            {/* Description */}
                            <p className="text-sm text-foreground/80 mt-1 leading-relaxed line-clamp-3">
                              {post.description}
                            </p>

                            {post.codeSnippet?.trim() && (
                              <p className="mt-3 text-[11px] text-text-muted">
                                Code: {formatLanguageLabel(post.codeLanguage)}
                              </p>
                            )}

                            {/* Read more */}
                            <Link href={`/post/${post.id}`}>
                              <span className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline mt-1">
                                Read more <FiArrowRight className="w-3 h-3" />
                              </span>
                            </Link>

                            {(isOwner || post.solved) && (
                              <div className="mt-3">
                                {isOwner && !post.solved && (
                                  <button
                                    onClick={() => openSolveModal(post)}
                                    className="text-[11px] font-semibold text-emerald-500 hover:underline"
                                  >
                                    Mark as solved
                                  </button>
                                )}

                                {isOwner && post.solved && (
                                  <button
                                    onClick={() => openSolveModal(post)}
                                    className="text-[11px] font-semibold text-emerald-500 hover:underline"
                                  >
                                    Update solution
                                  </button>
                                )}

                              </div>
                            )}

                            {/* Tags */}
                            {(post.tags || post.topics)?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(post.tags || post.topics || []).map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={() =>
                                      setTopicFilter(tag.toLowerCase())
                                    }
                                    className="text-[11px] text-primary-500 hover:underline font-medium"
                                  >
                                    #{tag}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* ── X-style action bar ── */}
                            <div className="flex items-center justify-between mt-3 -mx-1.5">
                              {/* Comments */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleComments(post.id)}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition group ${
                                  commentsExpanded
                                    ? "text-primary-500"
                                    : "text-text-muted hover:text-primary-500"
                                }`}
                              >
                                <span
                                  className={`p-1 rounded-full transition ${commentsExpanded ? "bg-primary-500/15" : "group-hover:bg-primary-500/10"}`}
                                >
                                  <FiMessageCircle className="w-4 h-4" />
                                </span>
                                {totalComments > 0 && (
                                  <span>{totalComments}</span>
                                )}
                              </motion.button>

                              {/* Like */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleLike(post)}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition group ${
                                  liked
                                    ? "text-red-400"
                                    : "text-text-muted hover:text-red-400"
                                }`}
                              >
                                <span
                                  className={`p-1 rounded-full transition ${liked ? "bg-red-500/15" : "group-hover:bg-red-500/10"}`}
                                >
                                  {liked ? (
                                    <AiFillHeart className="w-4 h-4" />
                                  ) : (
                                    <FiHeart className="w-4 h-4" />
                                  )}
                                </span>
                                {(post.likedBy?.length || 0) > 0 && (
                                  <span>{post.likedBy.length}</span>
                                )}
                              </motion.button>

                              {/* Share */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => sharePost(post)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-primary-500 transition group"
                              >
                                <span className="p-1 rounded-full group-hover:bg-primary-500/10 transition">
                                  <FiShare2 className="w-4 h-4" />
                                </span>
                                {(post.shares || 0) > 0 && (
                                  <span>{post.shares}</span>
                                )}
                              </motion.button>

                              {/* Save */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleSave(post)}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition group ${
                                  saved
                                    ? "text-primary-500"
                                    : "text-text-muted hover:text-primary-500"
                                }`}
                              >
                                <span
                                  className={`p-1 rounded-full transition ${saved ? "bg-primary-500/15" : "group-hover:bg-primary-500/10"}`}
                                >
                                  {saved ? (
                                    <CiBookmark className="w-4 h-4" />
                                  ) : (
                                    <FiBookmark className="w-4 h-4" />
                                  )}
                                </span>
                              </motion.button>

                              {/* Views — display only */}
                              <span className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-text-muted">
                                <FiEye className="w-3.5 h-3.5" />
                                {post.viewedBy?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── COMMENT SECTION ─────────────────────────
                          BUG 2 FIX: was exit={{ opacity: 0, height: 0 }}
                          Framer Motion has to measure "auto" height before
                          animating to 0, causing a one-frame full-height snap.
                          Fix: exit with opacity only — smooth fade, no snap. */}
                      <AnimatePresence>
                        {commentsExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-border/50"
                          >
                            <div className="px-4 py-3 space-y-4">
                              {/* Thread */}
                              {topLevelComments.length > 0 ? (
                                <div className="space-y-4">
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
                                  No comments yet — be the first!
                                </p>
                              )}

                              {/* New top-level comment */}
                              <div className="flex gap-3 items-center pt-1 border-t border-border/40">
                                <img
                                  src={
                                    userImg ||
                                    `https://api.dicebear.com/7.x/identicon/svg?seed=${userUsername}`
                                  }
                                  className="w-7 h-7 rounded-full border border-border object-cover flex-shrink-0"
                                  alt="You"
                                />
                                <CommentInputBox
                                  placeholder="Add a comment…"
                                  onSubmit={(text) => addComment(post.id, text)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="border border-t-0 border-border lg:rounded-b-2xl p-16 text-center space-y-3">
              <p className="text-text-muted text-sm">
                {searchQuery || topicFilter !== "all"
                  ? "No posts match your filters."
                  : "No posts yet. Check back soon!"}
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

      {/* ── DELETE MODAL ─────────────────────────────── */}
      <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, post: null })}
        PaperProps={{
          sx: {
            backgroundColor: "var(--surface)",
            color: "var(--foreground)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            minWidth: "320px",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Delete post
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
            Whoa! Careful now 😅 — this can't be undone. Delete &quot;
            <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
              {deleteModal.post?.title}
            </span>
            &quot;?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteModal({ open: false, post: null })}
            sx={{
              textTransform: "none",
              color: "var(--text-muted)",
              borderRadius: "8px",
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
              borderRadius: "8px",
              "&:hover": { backgroundColor: "rgba(239,68,68,0.25)" },
            }}
          >
            {deletingPostId === deleteModal.post?.id ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={solveModal.open}
        onClose={closeSolveModal}
        PaperProps={{
          sx: {
            backgroundColor: "var(--surface)",
            color: "var(--foreground)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            minWidth: "320px",
            maxWidth: "560px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Mark post as solved
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Typography variant="body2" sx={{ color: "var(--text-muted)", mb: 2 }}>
            Share the fix that worked for you. If you want, you can include a
            code block using triple backticks and the language, like
            <br />
            <code>```javascript</code>
          </Typography>
          <textarea
            value={solveModal.text}
            onChange={(event) =>
              setSolveModal((current) => ({
                ...current,
                text: event.target.value,
              }))
            }
            rows={8}
            placeholder="Tell people what solved the issue for you. Add a code snippet here too if it helps."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-text-muted outline-none"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={closeSolveModal}
            disabled={Boolean(solvingPostId)}
            sx={{
              textTransform: "none",
              color: "var(--text-muted)",
              borderRadius: "8px",
            }}
          >
            Don&apos;t proceed
          </Button>
          <Button
            onClick={markPostSolved}
            disabled={Boolean(solvingPostId)}
            sx={{
              textTransform: "none",
              backgroundColor: "rgba(16,185,129,0.14)",
              color: "#10b981",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "rgba(16,185,129,0.24)" },
            }}
          >
            {solvingPostId ? "Saving..." : "Proceed"}
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
