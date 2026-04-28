"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
import { FiArrowLeft, FiExternalLink, FiEye } from "react-icons/fi";
import GitHubBadge from "@/Components/GitHubBadge";
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
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);
  const trackedView = useRef(false);

  useEffect(() => {
    if (!params?.id) return;
    trackedView.current = false;

    const reference = doc(db, "blogPosts", params.id);
    const unsubscribe = onSnapshot(reference, async (snapshot) => {
      if (!snapshot.exists()) {
        setMissing(true);
        setPost(null);
        return;
      }

      setMissing(false);
      const nextPost = { id: snapshot.id, ...snapshot.data() };
      setPost(nextPost);

      if (!trackedView.current) {
        trackedView.current = true;
        updateDoc(reference, { views: increment(1) }).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, [params?.id]);

  const tags = useMemo(() => post?.tags || [], [post?.tags]);

  if (!post && !missing) {
    return <BlogDetailSkeleton />;
  }

  if (missing) {
    return (
      <main className="page-shell">
        <section className="section-shell flex flex-col items-center gap-4 px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Article not found
          </h1>
          <p className="max-w-md text-sm leading-7 text-text-muted">
            This post may have been removed or the link is no longer valid.
          </p>
          <Link href="/blog" className="btn-primary">
            Return to blog workspace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-foreground"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back
      </button>

      <article className="section-shell overflow-hidden bg-emerald-200/20 rounded-3xl border border-emerald-200">
        <div className="border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              {post.category || "General"}
            </span>

            <span className="inline-flex items-center gap-2 text-xs text-text-muted">
              <FiEye className="h-3.5 w-3.5" />
              {post.views || 0} views
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-foreground md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-text-muted">
            {post.summary}
          </p>
          
        </div>
        

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.75fr_0.25fr]">
          <div className="space-y-6">
            {post.codeSnippet?.trim() && (
              <CodeSnippetPreview
                code={post.codeSnippet}
                language={post.codeLanguage}
                className="mb-2"
              />
            )}

            <div
              className="prose-saas"
              dangerouslySetInnerHTML={{ __html: post.content || "<p></p>" }}
            />
          </div>

          <aside className="space-y-4">
            <div className="panel-shell space-y-4 p-5">
              <div className="flex items-center gap-3">
                <img
                  src={
                    post.authorImg ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}`
                  }
                  alt={post.author || "Author"}
                  className="h-12 w-12 rounded-2xl border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {post.author || "Anonymous"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>

              <GitHubBadge
                href={post.authorGithubUrl}
                username={post.authorGithubUsername}
              />
              <BloggerBadge visible={post.authorIsBlogger} />

              {post.authorGithubUrl && (
                <a
                  href={post.authorGithubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-500"
                >
                  Author profile <FiExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {tags.length > 0 && (
              <div className="panel-shell p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Tags
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-primary-500/20 bg-primary-500/8 px-3 py-1 text-xs font-medium text-primary-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </article>
    </main>
  );
}
