"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import {
  FiHeart,
  FiBookmark,
  FiShare2,
  FiEye,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { CiBookmark } from "react-icons/ci";
import toast, { Toaster } from "react-hot-toast";

export default function BlogsPage({ session }) {
  const userId = session?.user?.id || session?.user?.email || "anonymous";

  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("recent");

  // ── FETCH ─────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "blogPosts"), (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return () => unsub();
  }, []);

  // ── FILTER ────────────────────────
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q)
      );
    }

    if (sortMode === "popular") {
      result.sort(
        (a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0)
      );
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [posts, searchQuery, sortMode]);

  // ── ACTIONS ───────────────────────
  const toggleLike = async (post) => {
    const ref = doc(db, "blogPosts", post.id);
    const liked = post.likedBy?.includes(userId);

    await updateDoc(ref, {
      likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
    });

    toast.success(liked ? "Unliked" : "Liked ❤️", { duration: 1200 });
  };

  const toggleSave = async (post) => {
    const ref = doc(db, "blogPosts", post.id);
    const saved = post.savedBy?.includes(userId);

    await updateDoc(ref, {
      savedBy: saved ? arrayRemove(userId) : arrayUnion(userId),
    });

    toast.success(saved ? "Unsaved" : "Saved 🔖", { duration: 1200 });
  };

  const sharePost = async (post) => {
    const url = `${window.location.origin}/blogs/${post.id}`;
    await navigator.clipboard.writeText(url);

    await updateDoc(doc(db, "blogPosts", post.id), {
      shares: increment(1),
    });

    toast.success("Link copied", { duration: 1200 });
  };

  // ── UI ────────────────────────────
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-center" />

      <div className="max-w-3xl mx-auto border-x border-border">

        {/* HEADER (Explore style) */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
          <h1 className="text-base font-bold">Blogs</h1>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm outline-none"
            />

            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="bg-surface border border-border rounded-lg px-2 text-sm"
            >
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        {/* FEED */}
        {filteredPosts.length > 0 ? (
          <div className="divide-y divide-border">

            {filteredPosts.map((post) => {
              const liked = post.likedBy?.includes(userId);
              const saved = post.savedBy?.includes(userId);

              return (
                <article
                  key={post.id}
                  className="px-4 py-4 hover:bg-surface/50 transition"
                >
                  <div className="flex gap-3">

                    {/* Avatar */}
                    <img
                      src={
                        post.authorImg ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}`
                      }
                      className="w-10 h-10 rounded-full border border-border"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">

                      {/* Author */}
                      <div className="text-sm font-bold">
                        {post.author || "Anonymous"}
                      </div>

                      {/* Title */}
                      <h2 className="text-sm font-bold leading-snug mt-1">
                        {post.title}
                      </h2>

                      {/* Summary */}
                      <p className="text-sm text-foreground/80 mt-1 line-clamp-2">
                        {post.summary}
                      </p>

                      {/* Read */}
                      <Link href={`/blogs/${post.id}`}>
                        <span className="text-xs text-primary-500 hover:underline mt-1 inline-block">
                          Read more →
                        </span>
                      </Link>

                      {/* ACTION BAR (IDENTICAL STYLE) */}
                      <div className="flex items-center justify-between mt-3 -mx-1.5">

                        <div className="flex gap-4">

                          {/* Like */}
                          <button
                            onClick={() => toggleLike(post)}
                            className={`flex items-center gap-1 text-xs ${
                              liked
                                ? "text-red-400"
                                : "text-text-muted hover:text-red-400"
                            }`}
                          >
                            {liked ? <AiFillHeart /> : <FiHeart />}
                            {post.likedBy?.length || 0}
                          </button>

                          {/* Share */}
                          <button
                            onClick={() => sharePost(post)}
                            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary-500"
                          >
                            <FiShare2 />
                            {post.shares || 0}
                          </button>

                          {/* Save */}
                          <button
                            onClick={() => toggleSave(post)}
                            className={`flex items-center gap-1 text-xs ${
                              saved
                                ? "text-primary-500"
                                : "text-text-muted hover:text-primary-500"
                            }`}
                          >
                            {saved ? <CiBookmark /> : <FiBookmark />}
                          </button>
                        </div>

                        {/* Views */}
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <FiEye />
                          {post.viewedBy?.length || 0}
                        </div>

                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

          </div>
        ) : (
          <div className="p-10 text-center text-sm text-text-muted">
            No blogs found.
          </div>
        )}
      </div>
    </main>
  );
}