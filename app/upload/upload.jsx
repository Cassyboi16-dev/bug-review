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
import { FiArrowLeft, FiTrash2, FiEye, FiHeart, FiClock } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { CodeSnippetPreview } from "@/Components/CodeSnippetBlock";
import toast from "react-hot-toast";

function formatDate(value) {
  if (!value) return "Just now";
  
  let date;
  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }

  if (isNaN(date.getTime())) return "Just now";

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
  const hasIncrementedRef = useRef(false);

  const postId = params?.id;

  useEffect(() => {
    if (!postId) return;

    const docRef = doc(db, "bugPosts", postId);

    // Safely increment view tracking once per visit
    if (!hasIncrementedRef.current) {
      hasIncrementedRef.current = true;
      updateDoc(docRef, { views: increment(1) }).catch(() => {
        // Silently ignore view counter update errors
      });
    }

    // Subscribe to live post updates
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setPost(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  const userEmail = session?.user?.email;
  const isLiked = Array.isArray(post?.likes) && userEmail ? post.likes.includes(userEmail) : false;
  const isAuthor = userEmail && post?.authorEmail === userEmail;

  const handleLikeToggle = async () => {
    if (!session) {
      toast.error("Please sign in to like posts");
      return;
    }
    if (!postId) return;

    const docRef = doc(db, "bugPosts", postId);

    try {
      if (isLiked) {
        await updateDoc(docRef, { likes: arrayRemove(userEmail) });
      } else {
        await updateDoc(docRef, { likes: arrayUnion(userEmail) });
      }
    } catch (err) {
      console.error("Error updating likes:", err);
      toast.error("Failed to update like");
    }
  };

  const handleDelete = async () => {
    if (!isAuthor || !postId) return;

    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "bugPosts", postId));
      toast.success("Post deleted successfully");
      router.push("/");
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error("Failed to delete post");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Post Not Found</h2>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <FiArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FiClock className="w-4 h-4" /> {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <FiEye className="w-4 h-4" /> {post.views || 0} views
              </span>
            </div>
          </div>

          {/* Delete button (only for author) */}
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900 transition-colors self-start md:self-auto disabled:opacity-50"
            >
              <FiTrash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Post"}
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {post.description || post.content}
          </p>
        </div>

        {/* Code Snippet Preview */}
        {post.codeSnippet && (
          <div className="mb-6">
            <CodeSnippetPreview code={post.codeSnippet} language={post.language || "javascript"} />
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isLiked
                ? "bg-red-50 dark:bg-red-950/40 text-red-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            {isLiked ? (
              <AiFillHeart className="w-5 h-5 text-red-500" />
            ) : (
              <FiHeart className="w-5 h-5" />
            )}
            <span>{post.likes?.length || 0} Likes</span>
          </button>
        </div>
      </article>
    </div>
  );
}
