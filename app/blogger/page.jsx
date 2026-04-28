"use client";

import { useEffect, useState } from "react";
import { db } from "@/config/firebase.config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";

import dynamic from "next/dynamic";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiSend,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";

/* ✅ SSR-safe syntax highlighting */
const CodeSnippetPreview = dynamic(
  () =>
    import("@/Components/CodeSnippetBlock").then(
      (m) => m.CodeSnippetPreview
    ),
  { ssr: false }
);

/* ───────────────────────────── */
/* COMMENT INPUT */
/* ───────────────────────────── */
function CommentInput({ onSubmit }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Add a comment..."
        className="flex-1 px-4 py-2 rounded-full bg-background border border-border text-sm"
      />
      <button
        onClick={submit}
        className="p-2 rounded-full bg-primary-500 text-white"
      >
        <FiSend />
      </button>
    </div>
  );
}

/* ───────────────────────────── */
/* COMMENT NODE */
/* ───────────────────────────── */
function CommentNode({ comment, allComments, postId }) {
  const replies = allComments.filter(
    (c) => c.parentId === comment.id
  );

  return (
    <div className="ml-2 mt-2">
      <p className="text-sm text-foreground">{comment.text}</p>

      {replies.length > 0 && (
        <div className="ml-4 border-l border-border pl-3 mt-2 space-y-2">
          {replies.map((r) => (
            <CommentNode
              key={r.id}
              comment={r}
              allComments={allComments}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── */
/* MAIN PAGE */
/* ───────────────────────────── */
export default function BloggerPage() {
  const [posts, setPosts] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});

  /* ── Fetch posts ── */
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "blogPosts"),
      (snap) => {
        setPosts(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );
    return () => unsub();
  }, []);

  /* ── Like ── */
  const toggleLike = async (post) => {
    const ref = doc(db, "blogPosts", post.id);
    const liked = post.likedBy?.includes("user");

    await updateDoc(ref, {
      likedBy: liked
        ? arrayRemove("user")
        : arrayUnion("user"),
    });
  };

  /* ── Comment ── */
  const addComment = async (postId, text) => {
    const entry = {
      id: Date.now().toString(),
      text,
      parentId: null,
      createdAt: Date.now(),
    };

    await updateDoc(doc(db, "blogPosts", postId), {
      comments: arrayUnion(entry),
    });

    toast.success("Comment added");
  };

  /* ── Share (SSR safe) ── */
  const sharePost = async (post) => {
    if (typeof window === "undefined") return;

    const url = `${window.location.origin}/blogs/${post.id}`;

    await navigator.clipboard.writeText(url);

    await updateDoc(doc(db, "blogPosts", post.id), {
      shares: increment(1),
    });

    toast.success("Link copied");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-center" />

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-xl font-bold">Blogger</h1>

        {posts.map((post) => {
          const liked = post.likedBy?.includes("user");

          return (
            <div
              key={post.id}
              className="border border-border rounded-2xl p-4 space-y-3"
            >
              {/* Title */}
              <h2 className="font-bold text-lg">
                {post.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-foreground/80">
                {post.summary}
              </p>

              {/* Code */}
              {post.codeSnippet && (
                <CodeSnippetPreview
                  code={post.codeSnippet}
                  language={post.codeLanguage}
                />
              )}

              {/* Read More */}
              <Link
                href={`/blogs/${post.id}`}
                className="text-blue-500 text-sm hover:underline"
              >
                Read more 
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-4 text-sm text-text-muted">
                {/* Like */}
                <button
                  onClick={() => toggleLike(post)}
                  className="flex items-center gap-1"
                >
                  {liked ? (
                    <AiFillHeart className="text-red-400" />
                  ) : (
                    <FiHeart />
                  )}
                  {post.likedBy?.length || 0}
                </button>

                {/* Comment */}
                <button
                  onClick={() =>
                    setExpandedComments((p) => ({
                      ...p,
                      [post.id]: !p[post.id],
                    }))
                  }
                  className="flex items-center gap-1"
                >
                  <FiMessageCircle />
                  {post.comments?.length || 0}
                </button>

                {/* Share */}
                <button
                  onClick={() => sharePost(post)}
                  className="flex items-center gap-1"
                >
                  <FiShare2 />
                </button>
              </div>

              {/* Comments */}
              <AnimatePresence>
                {expandedComments[post.id] && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-t border-border pt-3 space-y-3"
                  >
                    {(post.comments || []).map((c) => (
                      <CommentNode
                        key={c.id}
                        comment={c}
                        allComments={post.comments}
                        postId={post.id}
                      />
                    ))}

                    <CommentInput
                      onSubmit={(text) =>
                        addComment(post.id, text)
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </main>
  );
}