"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/config/firebase.config";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useSession } from "next-auth/react";

/* =========================
   COMMENT INPUT
========================= */
function CommentInputBox({ placeholder, onSubmit, autoFocus = false }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  };

  return (
    <div className="flex gap-2 flex-1 items-center min-w-0">
      <input
        autoFocus={autoFocus}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button
        onClick={handleSubmit}
        className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
      >
        ➤
      </button>
    </div>
  );
}

/* =========================
   RECURSIVE COMMENT NODE
========================= */
function CommentNode({
  comment,
  allComments,
  depth,
  onAddReply,
  getRelativeTime,
}) {
  const [showReply, setShowReply] = useState(false);
  const [showChildren, setShowChildren] = useState(true);

  const children = allComments.filter((c) => c.parentId === comment.id);

  const indent = Math.min(depth * 16, 48);

  return (
    <div style={{ marginLeft: indent }}>
      <div className="bg-background border border-border/40 rounded-lg p-3 space-y-1.5">

        {/* USER INFO */}
        <div className="flex items-start gap-2 min-w-0">
          <img
            src={
              comment.authorImg ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author}`
            }
            className="w-6 h-6 rounded-full border border-border object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-foreground">
                {comment.author}
              </p>
              <span className="text-xs text-text-muted">
                {getRelativeTime(comment.createdAt)}
              </span>
            </div>

            <p className="text-sm text-foreground break-words whitespace-pre-wrap">
              {comment.text}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 pl-8">
          <button
            onClick={() => setShowReply((v) => !v)}
            className="text-xs text-text-muted hover:text-primary-500"
          >
            Reply
          </button>

          {children.length > 0 && (
            <button
              onClick={() => setShowChildren((v) => !v)}
              className="text-xs text-primary-500"
            >
              {children.length} replies
            </button>
          )}
        </div>

        {/* REPLY BOX */}
        {showReply && (
          <div className="pl-8 pt-1">
            <CommentInputBox
              placeholder="Write a reply..."
              onSubmit={(text) => {
                onAddReply(comment.id, text);
                setShowReply(false);
              }}
            />
          </div>
        )}
      </div>

      {/* CHILDREN */}
      {showChildren && children.length > 0 && (
        <div className="mt-2 space-y-2">
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
        </div>
      )}
    </div>
  );
}

/* =========================
   MAIN PAGE
========================= */
export default function PostPage() {
  const { id } = useParams();
  const { data: session } = useSession();

  const userId =
    session?.user?.email ||
    session?.user?.id ||
    "anonymous";

  const userName =
    session?.user?.name ||
    session?.user?.username ||
    "Anonymous";

  const userImg =
    session?.user?.image ||
    "";

  const [post, setPost] = useState(null);

  useEffect(() => {
    const ref = doc(db, "bugPosts", id);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    });

    return () => unsub();
  }, [id]);

  const getRelativeTime = (ts) => {
    if (!ts) return "now";
    const d =
      typeof ts === "number"
        ? ts
        : ts.toDate?.() || new Date(ts);

    const diff = Date.now() - d;
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  if (!post) {
    return (
      <div className="p-10 text-center text-text-muted">
        Loading...
      </div>
    );
  }

  const allComments = post.comments || [];
  const topLevel = allComments.filter((c) => !c.parentId);

  /* =========================
     ADD COMMENT
  ========================= */
  const addComment = async (text) => {
    const entry = {
      id: Date.now().toString(),
      parentId: null,
      authorId: userId,
      author: userName,
      authorImg: userImg,
      text,
      createdAt: Date.now(),
    };

    await updateDoc(doc(db, "bugPosts", id), {
      comments: arrayUnion(entry),
    });
  };

  /* =========================
     ADD REPLY
  ========================= */
  const addReply = async (parentId, text) => {
    const entry = {
      id: Date.now().toString(),
      parentId,
      authorId: userId,
      author: userName,
      authorImg: userImg,
      text,
      createdAt: Date.now(),
    };

    await updateDoc(doc(db, "bugPosts", id), {
      comments: arrayUnion(entry),
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* ================= POST ================= */}
        <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
          <h1 className="text-xl font-bold break-words">
            {post.title}
          </h1>

          <p className="text-sm text-foreground break-words whitespace-pre-wrap leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* ================= COMMENT INPUT ================= */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={
                userImg ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${userName}`
              }
              className="w-8 h-8 rounded-full border border-border"
            />
            <p className="text-xs text-text-muted">{userName}</p>
          </div>

          <CommentInputBox
            placeholder="Write a comment..."
            onSubmit={addComment}
          />
        </div>

        {/* ================= COMMENTS ================= */}
        <div className="space-y-2">
          {topLevel.length === 0 ? (
            <p className="text-sm text-text-muted text-center">
              No comments yet
            </p>
          ) : (
            topLevel.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                allComments={allComments}
                depth={0}
                onAddReply={addReply}
                getRelativeTime={getRelativeTime}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}