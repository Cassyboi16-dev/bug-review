"use client";

import { useState } from "react";

export default function LikeButton({ postId, userId, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/blogs/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      setLikes((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch {
      console.error("Like failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      className="border px-3 py-1 rounded-lg text-sm"
    >
      ❤️ {likes}
    </button>
  );
}