"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  FiArrowLeft,
  FiExternalLink,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import GitHubBadge from "@/Components/GitHubBadge";
import DiscordBadge from "@/Components/DiscordBadge";
import BloggerBadge from "@/Components/BloggerBadge";
import { CodeSnippetPreview } from "@/Components/CodeSnippetBlock";
import { db } from "@/config/firebase.config";

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

function BlogDetailSkeleton() {
  return (
    <main className="page-shell">
      <div className="section-shell animate-pulse space-y-6 px-6 py-8">
        <div className="h-4 w-24 rounded bg-surface-muted" />
        <div className="space-y-3">
          <div className="h-10 w-2/3 rounded bg-surface-muted" />
          <div className="h-5 w-1/2 rounded bg-surface-muted" />
        </div>
        <div className="h-60 rounded-3xl bg-surface-muted" />
      </div>
    </main>
  );
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasIncrementedRef = useRef(false);

  const blogId = params?.id;

  // Realtime subscription and view count increment
  useEffect(() => {
    if (!blogId) return;

    const docRef = doc(db, "blogs", blogId);

    // Increment view count once per session
    if (!hasIncrementedRef.current) {
      hasIncrementedRef.current = true;
      updateDoc(docRef, {
        views: increment(1),
      }).catch((err) => {
        // Silently catch permission errors if views update isn't strictly required
        console.error("Failed to increment views (check firestore rules):", err);
      });
    }

    // Subscribe to real-time document updates
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() });
        } else {
          setBlog(null);
          toast.error("Blog post not found");
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
  }, [blogId]);

  // Delete post handler
  const handleDelete = async () => {
    if (!blogId || isDeleting) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog post?"
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "blogs", blogId));
      toast.success("Blog deleted successfully");
      router.push("/blogs");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete blog. Ensure you have proper permissions.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <BlogDetailSkeleton />;
  }

  if (!blog) {
    return (
      <main className="page-shell px-6 py-12 text-center">
        <h2 className="text-2xl font-bold">Blog post not found</h2>
        <p className="mt-2 text-muted">It may have been removed or deleted.</p>
        <Link
          href="/blogs"
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <FiArrowLeft /> Back to Blogs
        </Link>
      </main>
    );
  }

  const isAuthor =
    session?.user?.email &&
    (blog?.authorEmail === session.user.email ||
      blog?.authorId === session.user.id);

  return (
    <main className="page-shell px-6 py-8 max-w-4xl mx-auto space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <FiArrowLeft /> Back to Blogs
        </Link>

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            <FiTrash2 /> {isDeleting ? "Deleting..." : "Delete Post"}
          </button>
        )}
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{blog.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span>By {blog.authorName || "Anonymous"}</span>
          <span>•</span>
          <span>{formatDate(blog.createdAt)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FiEye className="w-4 h-4" /> {blog.views || 0} views
          </span>
        </div>

        {/* Platform Badges */}
        <div className="flex items-center gap-2 pt-2">
          {blog.githubUrl && <GitHubBadge url={blog.githubUrl} />}
          {blog.discordUrl && <DiscordBadge url={blog.discordUrl} />}
          {blog.bloggerUrl && <BloggerBadge url={blog.bloggerUrl} />}
        </div>
      </div>

      {/* Main Content */}
      <div className="prose dark:prose-invert max-w-none pt-4">
        <p className="whitespace-pre-wrap">{blog.content}</p>
      </div>

      {/* Optional Code Snippet Section */}
      {blog.codeSnippet && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Code Snippet</h3>
          <CodeSnippetPreview
            code={blog.codeSnippet}
            language={blog.language || "javascript"}
          />
        </div>
      )}
    </main>
  );
}
