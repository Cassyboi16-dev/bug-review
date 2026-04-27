"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase.config";

export default function BlogsPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const ref = collection(db, "blogPosts");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="page-shell p-6">
      <h1 className="text-2xl font-bold mb-6">Blogs</h1>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded-xl">
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="text-sm text-gray-500">{post.summary}</p>

            {/* ✅ THIS is where dynamic linking happens */}
            <Link
              href={`/blogs/${post.id}`}
              className="text-blue-500 mt-2 inline-block"
            >
              Read More →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}