"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/config/firebase.config";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
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
  FiTrash2,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { HiTrendingUp } from "react-icons/hi";
import { CodeSnippetPreview } from "@/Components/CodeSnippetBlock";
import GitHubBadge from "@/Components/GitHubBadge";
import toast from "react-hot-toast";

function formatDate(value) {
  if (!value) return "Just now";
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : new Date(typeof value === "string" ? value : Number(value));

  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentText, setCommentText] = useState("");

  const hasIncrementedRef = useRef(false);
  const postId = params?.id;

  // Real-time Firestore sync & View count increment
  useEffect(() => {
    if (!postId) return;

    // Use "posts" (or "blogs" if your collection is named blogs)
    const docRef = doc(db, "posts", postId);

    // Safely increment view count once per visit
    if (!hasIncrementedRef.current) {
      hasIncrementedRef.current = true;
      updateDoc(docRef, {
        views: increment(1),
      }).catch((err) => {
        console.warn("View counter update failed:", err.message);
      });
    }

    // Subscribe to document updates
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setPost(null);
          toast.error("Post not found");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore fetch error:", error);
        toast.error("Permission denied or error loading post.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  // Handle Like Toggle
  const handleLike = async () => {
    if (!session?.user?.id || !postId) {
      toast.error("Please sign in to like posts");
      return;
    }

    const docRef = doc(db, "posts", postId);
    const userId = session.user.id;
    const isLiked = post?.likes?.includes(userId);

    try {
      await updateDoc(docRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
      });
    } catch (err) {
      console.error("Error updating likes:", err);
      toast.error("Could not update like");
    }
  };

  // Handle Post Deletion
  const handleDelete = async () => {
    if (!postId || isDeleting) return;

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "posts", postId));
      toast.success("Post deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post. Permission denied.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
        <p className="text-gray-500 mb-4">
          This post does not exist or may have been deleted.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          <FiArrowLeft /> Go back
        </button>
      </div>
    );
  }

  const isAuthor =
    session?.user?.id === post?.authorId ||
    session?.user?.email === post?.authorEmail;
  const isLiked = post?.likes?.includes(session?.user?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black dark:hover:text-white"
        >
          <FiArrowLeft /> Back
        </button>

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            <FiTrash2 /> {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {/* Main Title & Metadata */}
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span>By {post.authorName || "Anonymous"}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FiClock /> {formatDate(post.createdAt)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FiEye /> {post.views || 0} views
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none py-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Code Snippet if present */}
      {post.codeSnippet && (
        <div className="my-6">
          <CodeSnippetPreview
            code={post.codeSnippet}
            language={post.language || "javascript"}
          />
        </div>
      )}

      {/* Social / Action Bar */}
      <div className="flex items-center gap-6 border-t border-b py-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
        >
          {isLiked ? (
            <AiFillHeart className="w-5 h-5 text-red-500" />
          ) : (
            <FiHeart className="w-5 h-5 text-gray-500 hover:text-red-500" />
          )}
          <span>{post.likes?.length || 0} Likes</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiMessageCircle className="w-5 h-5" />
          <span>{post.comments?.length || 0} Comments</span>
        </div>
      </div>
    </div>
  );
}
