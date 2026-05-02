"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiShare2,
  FiTrash2,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { db } from "@/config/firebase.config";

const CodeSnippetPreview = dynamic(
  () =>
    import("@/Components/CodeSnippetBlock").then(
      (module) => module.CodeSnippetPreview,
    ),
  { ssr: false },
);

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
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && submit()}
        placeholder="Add a comment..."
        className="input min-w-0 flex-1 rounded-full py-2 text-sm"
      />
      <button
        type="button"
        onClick={submit}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white"
        aria-label="Send comment"
      >
        <FiSend />
      </button>
    </div>
  );
}

function CommentNode({ comment, allComments, currentUserId, onDeleteComment }) {
  const replies = allComments.filter((item) => item.parentId === comment.id);
  const isOwner = Boolean(currentUserId && comment.authorId === currentUserId);

  return (
    <div className="mt-2 rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="break-words text-sm leading-6 text-foreground">
          {comment.text}
        </p>
        {isOwner && (
          <button
            type="button"
            onClick={() => onDeleteComment(comment.id)}
            className="rounded-full p-1 text-text-muted transition hover:bg-red-500/10 hover:text-red-400"
            aria-label="Delete comment"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-2 space-y-2 border-l border-border pl-3">
          {replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              allComments={allComments}
              currentUserId={currentUserId}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BloggerPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || session?.user?.profileId || "";
  const userName =
    session?.user?.username || session?.user?.name || "Anonymous";
  const userImg = session?.user?.image || "";
  const userGithubUrl = session?.user?.githubProfileUrl || "";
  const userGithubUsername = session?.user?.githubUsername || "";
  const userDiscordUsername = session?.user?.discordUsername || "";
  const userHasDiscord = session?.user?.linkedProviders?.includes("discord");
  const userIsBlogger = Boolean(session?.user?.bloggerBadge);

  const [posts, setPosts] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [deletingPostId, setDeletingPostId] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "blogPosts"), (snapshot) => {
      setPosts(
        snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((left, right) => {
            const leftDate = new Date(
              left.updatedAt || left.createdAt || 0,
            ).getTime();
            const rightDate = new Date(
              right.updatedAt || right.createdAt || 0,
            ).getTime();
            return rightDate - leftDate;
          }),
      );
    });

    return () => unsubscribe();
  }, []);

  const toggleLike = async (post) => {
    if (!userId) {
      toast.error("Sign in to like posts");
      return;
    }

    const reference = doc(db, "blogPosts", post.id);
    const liked = post.likedBy?.includes(userId);

    await updateDoc(reference, {
      likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
    });
  };

  const addComment = async (postId, text) => {
    if (!userId) {
      toast.error("Sign in to comment");
      return;
    }

    await updateDoc(doc(db, "blogPosts", postId), {
      comments: arrayUnion({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        text,
        authorId: userId,
        author: userName,
        authorImg: userImg,
        authorGithubUrl: userGithubUrl,
        authorGithubUsername: userGithubUsername,
        authorDiscordUsername: userDiscordUsername,
        authorHasDiscord: userHasDiscord,
        authorIsBlogger: userIsBlogger,
        parentId: null,
        createdAt: Date.now(),
      }),
    });

    toast.success("Comment added");
  };

  const deletePost = async (post) => {
    if (!post || post.authorId !== userId) {
      toast.error("You can only delete your own blog posts");
      return;
    }

    setDeletingPostId(post.id);
    try {
      await deleteDoc(doc(db, "blogPosts", post.id));
      toast.success("Blog post deleted");
    } catch {
      toast.error("Failed to delete blog post");
    } finally {
      setDeletingPostId("");
    }
  };

  const deleteComment = async (post, commentId) => {
    const comments = post.comments || [];
    const comment = comments.find((item) => item.id === commentId);

    if (!comment || comment.authorId !== userId) {
      toast.error("You can only delete your own comments");
      return;
    }

    const nextComments = comments
      .filter((item) => item.id !== commentId)
      .map((item) =>
        item.parentId === commentId
          ? { ...item, parentId: comment.parentId || null }
          : item,
      );

    try {
      await updateDoc(doc(db, "blogPosts", post.id), {
        comments: nextComments,
      });
      toast.success(comment.parentId ? "Reply deleted" : "Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const sharePost = async (post) => {
    if (typeof window === "undefined") return;

    await navigator.clipboard.writeText(`${window.location.origin}/blogs/${post.id}`);
    await updateDoc(doc(db, "blogPosts", post.id), {
      shares: increment(1),
    });

    toast.success("Link copied");
  };

  const totalViews = posts.reduce((total, post) => total + (post.views || 0), 0);
  const totalComments = posts.reduce(
    (total, post) => total + (post.comments?.length || 0),
    0,
  );

  return (
    <main className="page-shell space-y-6">
      <Toaster position="bottom-center" />

      <section className="hero-shell px-5 py-7 sm:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">
              <FiBookOpen className="h-3.5 w-3.5" />
              Community articles
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Read what developers are learning
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
                Practical posts, snippets, and debugging lessons from the
                BugReview community.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-72">
            {[
              ["Posts", posts.length],
              ["Views", totalViews],
              ["Notes", totalComments],
            ].map(([label, value]) => (
              <div key={label} className="metric-card text-center">
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => {
          const liked = post.likedBy?.includes(userId);
          const isOwner = Boolean(userId && post.authorId === userId);

          return (
            <article
              key={post.id}
              className="panel-shell flex min-h-full flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary-500/35"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  {post.category || "General"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                    <FiClock className="h-3.5 w-3.5" />
                    {post.readTimeMinutes || 1} min
                  </span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => deletePost(post)}
                      disabled={deletingPostId === post.id}
                      className="rounded-full p-1.5 text-text-muted transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                      aria-label="Delete blog post"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="line-clamp-2 text-lg font-bold leading-snug text-foreground">
                  {post.title}
                </h2>
                <p className="line-clamp-3 text-sm leading-7 text-text-muted">
                  {post.summary}
                </p>
              </div>

              {post.codeSnippet?.trim() && (
                <CodeSnippetPreview
                  code={post.codeSnippet}
                  language={post.codeLanguage}
                  compact
                />
              )}

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-muted">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <FiEye className="h-4 w-4" />
                    {post.views || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLike(post)}
                    className="inline-flex items-center gap-1 transition hover:text-red-400"
                  >
                    {liked ? (
                      <AiFillHeart className="text-red-400" />
                    ) : (
                      <FiHeart />
                    )}
                    {post.likedBy?.length || 0}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedComments((current) => ({
                        ...current,
                        [post.id]: !current[post.id],
                      }))
                    }
                    className="inline-flex items-center gap-1 transition hover:text-primary-500"
                  >
                    <FiMessageCircle />
                    {post.comments?.length || 0}
                  </button>
                  <button
                    type="button"
                    onClick={() => sharePost(post)}
                    className="inline-flex items-center gap-1 transition hover:text-primary-500"
                    aria-label="Share post"
                  >
                    <FiShare2 />
                  </button>
                </div>

                <Link
                  href={`/blogs/${post.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500"
                >
                  Read <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <AnimatePresence>
                {expandedComments[post.id] && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 border-t border-border pt-3"
                  >
                    {(post.comments || [])
                      .filter((comment) => !comment.parentId)
                      .map((comment) => (
                      <CommentNode
                        key={comment.id}
                        comment={comment}
                        allComments={post.comments || []}
                        currentUserId={userId}
                        onDeleteComment={(commentId) =>
                          deleteComment(post, commentId)
                        }
                      />
                    ))}

                    <CommentInput
                      onSubmit={(text) => addComment(post.id, text)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </section>
    </main>
  );
}
