"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import GitHubBadge from "@/Components/GitHubBadge";
import BloggerBadge from "@/Components/BloggerBadge";
import {
  CodeSnippetPreview,
  RichTextWithCode,
} from "@/Components/CodeSnippetBlock";

export default function BlogPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "blogPosts", id), (snapshot) => {
      if (!snapshot.exists()) return;
      setPost({ id: snapshot.id, ...snapshot.data() });
    });

    updateDoc(doc(db, "blogPosts", id), { views: increment(1) }).catch(() => {});

    return () => unsubscribe();
  }, [id]);

  if (!post) {
    return (
      <main className="min-h-dvh bg-background text-foreground px-4 py-10">
        <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-surface p-6">
          Loading blog post...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background text-foreground px-4 py-10">
      <article className="max-w-3xl mx-auto rounded-2xl border border-border bg-surface overflow-hidden">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover border-b border-border"
          />
        )}

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
              {post.category}
            </p>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-sm text-text-muted">{post.summary}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <img
              src={post.authorImg || "/default-avatar.png"}
              alt={post.author}
              className="w-10 h-10 rounded-full border border-border object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{post.author}</p>
              <p className="text-xs text-text-muted">
                {post.readTimeMinutes} min read · {post.views || 0} views
              </p>
            </div>
            <GitHubBadge
              href={post.authorGithubUrl}
              username={post.authorGithubUsername}
            />
            <BloggerBadge visible={post.authorIsBlogger} />
          </div>

          <RichTextWithCode text={post.content} />
          <CodeSnippetPreview
            code={post.codeSnippet}
            language={post.codeLanguage}
          />

          {(post.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
