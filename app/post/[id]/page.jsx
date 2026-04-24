"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/config/firebase.config";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiHeart,
  FiBookmark,
  FiShare2,
  FiEye,
  FiMessageCircle,
  FiSend,
  FiCornerDownRight,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiGlobe,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { HiTrendingUp } from "react-icons/hi";
import {
  CodeSnippetPreview,
  RichTextWithCode,
} from "@/Components/CodeSnippetBlock";
import GitHubBadge from "@/Components/GitHubBadge";
import { awardUserProgress } from "@/lib/client/gamification";

// ─── Country flag ──────────────────────────────
const COUNTRY_CODES = {
  nigeria:"NG","united states":"US",usa:"US","united kingdom":"GB",uk:"GB",
  canada:"CA",india:"IN",germany:"DE",france:"FR",australia:"AU",brazil:"BR",
  "south africa":"ZA",ghana:"GH",kenya:"KE",japan:"JP",china:"CN",
  singapore:"SG",netherlands:"NL",sweden:"SE",norway:"NO",denmark:"DK",
};
const toFlagEmoji = (code) =>
  code.toUpperCase().replace(/./g,(c)=>String.fromCodePoint(127397+c.charCodeAt(0)));
const getFlag = (name) => {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  const code = COUNTRY_CODES[n];
  return code ? toFlagEmoji(code) : null;
};

// ─── Relative time ─────────────────────────────
const getRelativeTime = (ts) => {
  if (!ts) return "just now";
  const d = typeof ts === "number" ? ts : ts?.toDate?.() || new Date(Number(ts));
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Lag-free comment input ────────────────────
function CommentInputBox({ placeholder, onSubmit, autoFocus = false, avatarSrc, avatarSeed }) {
  const [text, setText] = useState("");
  const handleSubmit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit(t);
    setText("");
  };
  return (
    <div className="flex gap-2.5 items-center">
      {(avatarSrc || avatarSeed) && (
        <img
          src={avatarSrc || `https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed}`}
          className="w-7 h-7 rounded-full border border-border object-cover flex-shrink-0"
          alt=""
        />
      )}
      <div className="flex-1 flex gap-2 items-center bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary-500 transition-colors">
        <input
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder-text-muted outline-none min-w-0"
        />
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleSubmit}
          className="flex-shrink-0 p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40"
          disabled={!text.trim()}
        >
          <FiSend className="w-3 h-3" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Recursive comment node ────────────────────
function CommentNode({ comment, allComments, depth, onAddReply }) {
  const [showReply, setShowReply] = useState(false);
  const [showChildren, setShowChildren] = useState(depth < 2);
  const children = allComments
    .filter((c) => c.parentId === comment.id)
    .sort((a, b) => a.createdAt - b.createdAt);
  const indent = Math.min(depth * 18, 54);

  return (
    <div style={{ marginLeft: indent }}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border/50 rounded-xl p-3.5 space-y-2"
      >
        {/* Author */}
        <div className="flex items-start gap-2.5">
          <img
            src={comment.authorImg || `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author}`}
            className="w-6 h-6 rounded-full border border-border object-cover flex-shrink-0 mt-0.5"
            alt={comment.author}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-foreground">{comment.author}</span>
              <GitHubBadge
                href={comment.authorGithubUrl}
                username={comment.authorGithubUsername}
                compact
              />
              <span className="text-[10px] text-text-muted">{getRelativeTime(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground mt-1 break-words whitespace-pre-wrap leading-relaxed">
              {comment.text}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pl-[34px]">
          <button
            onClick={() => setShowReply((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary-500 transition-colors"
          >
            <FiCornerDownRight className="w-3 h-3" />
            {showReply ? "Cancel" : "Reply"}
          </button>
          {children.length > 0 && (
            <button
              onClick={() => setShowChildren((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-primary-500 hover:underline"
            >
              {showChildren ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
              {children.length} {children.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Reply input */}
        <AnimatePresence>
          {showReply && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-[34px] overflow-hidden"
            >
              <CommentInputBox
                placeholder={`Reply to ${comment.author}…`}
                onSubmit={(text) => {
                  onAddReply(comment.id, text);
                  setShowReply(false);
                }}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Nested replies */}
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
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-4 bg-surface rounded w-24" />
        <div className="space-y-3">
          <div className="h-7 bg-surface rounded w-3/4" />
          <div className="h-4 bg-surface rounded w-1/2" />
        </div>
        <div className="bg-surface rounded-2xl h-48" />
        <div className="bg-surface rounded-2xl h-32" />
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────
export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const userId   = session?.user?.id || session?.user?.email || "anonymous";
  const userName = session?.user?.name  || session?.user?.username || "Anonymous";
  const userImg  = session?.user?.image || "";
  const userGithubUrl = session?.user?.githubProfileUrl || "";
  const userGithubUsername = session?.user?.githubUsername || "";
  const userProfileId = session?.user?.profileId || "";

  const [post, setPost] = useState(null);
  const [copied, setCopied] = useState(false);
  const viewTracked = useRef(false);

  // Live post subscription
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "bugPosts", id), (snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  // Track view once
  useEffect(() => {
    if (!post || viewTracked.current) return;
    if (!post.viewedBy?.includes(userId)) {
      updateDoc(doc(db, "bugPosts", id), { viewedBy: arrayUnion(userId) }).catch(() => {});
    }
    viewTracked.current = true;
  }, [post, userId, id]);

  if (!post) return <Skeleton />;

  const allComments  = post.comments || [];
  const topLevel     = allComments.filter((c) => !c.parentId).sort((a, b) => a.createdAt - b.createdAt);
  const liked        = post.likedBy?.includes(userId);
  const saved        = post.savedBy?.includes(userId);
  const viewCount    = post.viewedBy?.length || 0;
  const likeCount    = post.likedBy?.length  || 0;
  const commentCount = allComments.length;
  const flag         = getFlag(post.country);

  const trendingScore =
    likeCount * 3 +
    (post.savedBy?.length || 0) * 2 +
    (post.shares || 0) * 2 +
    commentCount * 2 +
    viewCount * 0.5;
  const isTrending = viewCount >= 5 && trendingScore >= 5;

  // Actions
  const toggleLike = () =>
    updateDoc(doc(db, "bugPosts", id), {
      likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
    });

  const toggleSave = () =>
    updateDoc(doc(db, "bugPosts", id), {
      savedBy: saved ? arrayRemove(userId) : arrayUnion(userId),
    });

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    updateDoc(doc(db, "bugPosts", id), { shares: increment(1) }).catch(() => {});
  };

  const addComment = async (text) => {
    await updateDoc(doc(db, "bugPosts", id), {
      comments: arrayUnion({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        parentId: null,
        authorId: userId,
        author: userName,
        authorImg: userImg,
        authorGithubUrl: userGithubUrl,
        authorGithubUsername: userGithubUsername,
        text,
        createdAt: Date.now(),
      }),
    });
    if (post.authorId && post.authorId !== userId) {
      await awardUserProgress(userProfileId, { solutionsOfferedCount: 1 });
    }
  };

  const addReply = async (parentId, text) => {
    await updateDoc(doc(db, "bugPosts", id), {
      comments: arrayUnion({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        parentId,
        authorId: userId,
        author: userName,
        authorImg: userImg,
        authorGithubUrl: userGithubUrl,
        authorGithubUsername: userGithubUsername,
        text,
        createdAt: Date.now(),
      }),
    });
    if (post.authorId && post.authorId !== userId) {
      await awardUserProgress(userProfileId, { solutionsOfferedCount: 1 });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ── BACK NAV ── */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground transition-colors group"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </motion.button>

        {/* ── POST CARD ── */}
        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface border border-border rounded-2xl overflow-hidden"
        >
          {/* Category bar */}
          {(post.category || isTrending || post.solved) && (
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-background/40">
              <div className="flex items-center gap-2 flex-wrap">
                {post.category && (
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                    {post.category}
                  </span>
                )}
                {post.solved && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    Solved
                  </span>
                )}
              </div>
              {isTrending && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-primary-500 bg-primary-500/10 border border-primary-500/25 px-2.5 py-0.5 rounded-full ml-auto">
                  <HiTrendingUp className="w-3 h-3" /> Trending
                </span>
              )}
            </div>
          )}

          <div className="px-5 py-5 space-y-4">
            {/* Author row */}
            <div className="flex items-center gap-3">
              <img
                src={post.authorImg || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}`}
                className="w-9 h-9 rounded-full border border-border object-cover flex-shrink-0"
                alt={post.author}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                  {post.author || "Anonymous"}
                </p>
                <div className="mt-1">
                  <GitHubBadge
                    href={post.authorGithubUrl}
                    username={post.authorGithubUsername}
                    compact
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5 flex-wrap">
                  {post.country && (
                    <span className="flex items-center gap-1">
                      {flag || <FiGlobe className="w-3 h-3" />}
                      {post.country}
                    </span>
                  )}
                  {post.country && (
                    <span className="text-border">·</span>
                  )}
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {getRelativeTime(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-foreground leading-snug">
              {post.title}
            </h1>

            {/* Description */}
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
              {post.description}
            </p>

            <CodeSnippetPreview
              code={post.codeSnippet}
              language={post.codeLanguage}
            />

            {post.solved && post.solutionText?.trim() && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500">
                    Shared solution
                  </p>
                  {post.solvedAt && (
                    <span className="text-[11px] text-text-muted">
                      {getRelativeTime(post.solvedAt)}
                    </span>
                  )}
                </div>
                <RichTextWithCode text={post.solutionText} />
              </div>
            )}

            {/* Tags */}
            {(post.tags || post.topics) && (post.tags || post.topics).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(post.tags || post.topics).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-primary-500 bg-primary-500/8 border border-primary-500/20 px-2.5 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 px-5 py-3 border-t border-border text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <FiEye className="w-3.5 h-3.5" />{viewCount} views
            </span>
            <span className="flex items-center gap-1.5">
              <FiHeart className="w-3.5 h-3.5" />{likeCount} likes
            </span>
            <span className="flex items-center gap-1.5">
              <FiMessageCircle className="w-3.5 h-3.5" />{commentCount} comments
            </span>
            <span className="flex items-center gap-1.5">
              <FiShare2 className="w-3.5 h-3.5" />{post.shares || 0} shares
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleLike}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                liked
                  ? "text-red-400 bg-red-500/5 hover:bg-red-500/10"
                  : "text-text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {liked
                ? <AiFillHeart className="w-4 h-4" />
                : <FiHeart className="w-4 h-4" />
              }
              {liked ? "Liked" : "Like"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleSave}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                saved
                  ? "text-primary-500 bg-primary-500/5 hover:bg-primary-500/10"
                  : "text-text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              <FiBookmark className="w-4 h-4" />
              {saved ? "Saved" : "Save"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={share}
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-text-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              <FiShare2 className="w-4 h-4" />
              {copied ? "Copied!" : "Share"}
            </motion.button>
          </div>
        </motion.article>

        {/* ── COMMENT INPUT ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-4 space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? "s" : ""}` : "Be the first to comment"}
          </p>
          <CommentInputBox
            placeholder="Share your thoughts or a fix…"
            onSubmit={addComment}
            avatarSrc={userImg}
            avatarSeed={userName}
          />
        </motion.div>

        {/* ── COMMENTS THREAD ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          {topLevel.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <FiMessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No comments yet.</p>
              <p className="text-xs mt-1">Have a fix or an insight? Add the first comment.</p>
            </div>
          ) : (
            topLevel.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                allComments={allComments}
                depth={0}
                onAddReply={addReply}
              />
            ))
          )}
        </motion.div>

      </div>
    </main>
  );
}
