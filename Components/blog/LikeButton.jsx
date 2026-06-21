"use client";

import { useState } from "react";
import { IoMdHeartEmpty } from "react-icons/io";

export default function LikeButton({ postId, userId, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/blogs/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Like failed");
      }

      setLikes(data.likes ?? ((prev) => (data.liked ? prev + 1 : prev - 1)));
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
      <IoMdHeartEmpty /> {likes}
    </button>
  );
}
