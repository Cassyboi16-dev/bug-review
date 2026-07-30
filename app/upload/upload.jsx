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

  const hasIncrementedRef = useRef(false);
  const postId = params?.id;

  useEffect(() => {
    if (!postId) return;

    // TARGETING 'bugPosts' TO MATCH upload.jsx
    const docRef = doc(db, "bugPosts", postId);

    // Safely increment view tracking once per visit
    if (!hasIncrementedRef.current) {
      hasIncrementedRef.current = true;
      const currentUserId = session?.user?.id || "anonymous";

      updateDoc(docRef, {
        views: increment(1),
        viewedBy: arrayUnion(currentUserId),
      }).catch((err) => {
        console.warn("View counter update skipped/failed:", err.message);
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
          toast.error("Bug report not found");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore read error:", error);
        toast.error("Permission denied or error fetching post.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postId, session?.user?.id]);

  const handleLike = async () => {
    if (!session?.user?.id || !postId) {
      toast.error("Please sign in to like posts");
      return;
    }

    const docRef = doc(db, "bugPosts", postId);
    const userId = session.user.id;
    const isLiked = post?.likedBy?.includes(userId);

    try {
      await updateDoc(docRef, {
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
      });
    } catch (err) {
      console.error("Error updating likes:", err);
      toast.error("Could not update like status.");
    }
  };

  const handleDelete = async () => {
    if (!postId || isDeleting) return;

    if (!window.confirm("Are you sure you want to delete this report?")) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "bugPosts", postId));
      toast.success("Report deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post. Check permissions.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-6 w-32 bg-border rounded" />
        <div className="h-10 w-3/4 bg-border rounded" />
        <div className="h-64 bg-border rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-primary-500 hover:underline"
        >
          <FiArrowLeft /> Go back
        </button>
      </div>
    );
  }

  const isAuthor =
    session?.user?.id === post?.authorId ||
    session?.user?.email === post?.authorEmail;
  const isLiked = post?.likedBy?.includes(session?.user?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-foreground"
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

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
          <span>By {post.author || "Anonymous"}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FiClock /> {formatDate(post.createdAt || post.datestamp)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FiEye /> {post.views || post.viewedBy?.length || 0} views
          </span>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none py-4">
        <p className="whitespace-pre-wrap">{post.description || post.content}</p>
      </div>

      {post.codeSnippet && (
        <div className="my-6">
          <CodeSnippetPreview
            code={post.codeSnippet}
            language={post.codeLanguage || "javascript"}
          />
        </div>
      )}

      <div className="flex items-center gap-6 border-t border-border pt-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
        >
          {isLiked ? (
            <AiFillHeart className="w-5 h-5 text-red-500" />
          ) : (
            <FiHeart className="w-5 h-5 text-text-muted hover:text-red-500" />
          )}
          <span>{post.likedBy?.length || 0} Likes</span>
        </button>
      </div>
    </div>
  );
}
