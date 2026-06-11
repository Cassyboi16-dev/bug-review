"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiClock,
  FiFileText,
  FiPenTool,
  FiShield,
  FiTrash2,
} from "react-icons/fi";
import { db } from "@/config/firebase.config";
import { awardUserProgress } from "@/lib/client/gamification";
import {
  CodeSnippetEditor,
  CodeSnippetPreview,
} from "@/Components/CodeSnippetBlock";
import Editor from "@/Components/blog/Editor";

function stripHtml(value = "") {
    e.preventDefault();
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadTime(value = "") {
  const wordCount = stripHtml(value).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(value) {
  if (!value) return "Just now";
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : new Date(typeof value === "string" ? value : Number(value));
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const initialPostForm = {
  title: "",
  summary: "",
  category: "",
  tags: "",
  content: "<p></p>",
  codeLanguage: "",
  codeSnippet: "",
  status: "published",
};

const initialSetupForm = {
  email: "",
  topics: "",
  reason: "",
  phone: "",
};

export default function BlogWorkspace({ session }) {
  const router = useRouter();
  const { update } = useSession();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState("");
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [form, setForm] = useState(initialPostForm);
  const [setupForm, setSetupForm] = useState({
    ...initialSetupForm,
    email: session?.user?.email || "",
  });

  const canPublish = Boolean(profile?.verifiedForBlogging);
  const readTime = useMemo(
    () => estimateReadTime(form.content),
    [form.content],
  );

  useEffect(() => {
    if (!session?.user?.profileId) return;

    const unsubscribeProfile = onSnapshot(
      doc(db, "users", session.user.profileId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const nextProfile = { id: snapshot.id, ...snapshot.data() };
        setProfile(nextProfile);
        setSetupForm((current) => ({
          ...current,
          email: nextProfile.verificationEmail || session.user.email || "",
          phone: nextProfile.verificationPhone || "",
        }));
      },
    );

    const postsQuery = query(
      collection(db, "blogPosts"),
      where("authorId", "==", session.user.profileId),
    );

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const nextPosts = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((left, right) => {
          const leftDate = new Date(
            left.updatedAt || left.createdAt || 0,
          ).getTime();
          const rightDate = new Date(
            right.updatedAt || right.createdAt || 0,
          ).getTime();
          return rightDate - leftDate;
        });
      setPosts(nextPosts);
    });

    return () => {
      unsubscribeProfile();
      unsubscribePosts();
    };
  }, [session?.user?.email, session?.user?.profileId]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateSetupField = (key, value) => {
    setSetupForm((current) => ({ ...current, [key]: value }));
  };

  const requestPublisherAccess = async () => {
    if (
      !setupForm.email.trim() ||
      !setupForm.topics.trim() ||
      !setupForm.reason.trim()
    ) {
      toast.error("Add your email, topics, and a short publishing focus.");
      return;
    }

    try {
      setRequestingAccess(true);
      const response = await fetch("/api/blogs/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setupForm),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not unlock blog publishing");
      }

      await update();
      toast.success("Publisher access is ready. You can publish now.");
    } catch (error) {
      toast.error(error.message || "Could not unlock blog publishing");
    } finally {
      setRequestingAccess(false);
    }
  };

  const publish = async () => {
    const cleanedContent = stripHtml(form.content);
    if (
      !form.title.trim() ||
      !form.summary.trim() ||
      !form.category.trim() ||
      !cleanedContent
    ) {
      toast.error("Title, summary, category, and body are required.");
      return;
    }

    try {
      setPublishing(true);
      const response = await fetch("/api/blogs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Publish failed");
      }

      await awardUserProgress(session.user.profileId, { blogPostsCount: 1 });
      setForm(initialPostForm);
      toast.success("Blog post published");
      router.push(`/blogger`);
    } catch (error) {
      toast.error(error.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const deletePost = async (post) => {
    if (!post || post.authorId !== session?.user?.profileId) {
      toast.error("You can only delete your own blog posts.");
      return;
    }

    const confirmed = window.confirm(`Delete "${post.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingPostId(post.id);
    try {
      await deleteDoc(doc(db, "blogPosts", post.id));
      toast.success("Blog post deleted");
    } catch {
      toast.error("Could not delete blog post");
    } finally {
      setDeletingPostId("");
    }
  };

  return (
    <main className="page-shell space-y-6">
      <section className="hero-shell px-5 py-6 md:px-7 md:py-7">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-3">
            <span className="eyebrow">
              <FiPenTool className="h-3.5 w-3.5" />
              Blog workspace
            </span>
            <div className="space-y-2">
              <h1 className="max-w-2xl text-2xl font-semibold tracking-tight md:text-3xl">
                Welcome to BugReview Blog Workspace
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-text-muted">
                Draft cleaner posts, attach runnable snippets, and manage your
                articles from one place without leaving the app.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Posts
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {posts.length}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Status
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {canPublish ? "Publisher ready" : "Setup required"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!canPublish && (
        <section className="section-shell grid gap-5 px-5 py-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <span className="eyebrow">
              <FiShield className="h-3.5 w-3.5" />
              Publisher setup
            </span>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                Unlock your blog once and keep writing.
              </h2>
              <p className="text-sm leading-6 text-text-muted">
                We use your signed-in account as the identity anchor, then store
                the author details you want attached to published articles.
              </p>
            </div>
          </div>

          <div className="panel-shell grid gap-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-foreground">
                Publishing email (required)
                <input
                  type="email"
                  value={setupForm.email}
                  onChange={(event) =>
                    updateSetupField("email", event.target.value)
                  }
                  className="input"
                  placeholder="you@example.com"
                />
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Phone number (optional)
                <input
                  type="tel"
                  value={setupForm.phone}
                  onChange={(event) =>
                    updateSetupField("phone", event.target.value)
                  }
                  className="input"
                  placeholder="+234..."
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm text-foreground">
              Topics you plan to write about (required)
              <input
                type="text"
                value={setupForm.topics}
                onChange={(event) =>
                  updateSetupField("topics", event.target.value)
                }
                className="input"
                placeholder="Next.js, Firebase, debugging, DX"
              />
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              What should readers expect from your posts? (required)
              <textarea
                value={setupForm.reason}
                onChange={(event) =>
                  updateSetupField("reason", event.target.value)
                }
                className="textarea"
                placeholder="Short practical write-ups, production lessons, and fixes that save people time."
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs leading-6 text-text-muted">
                Your current session stays the source of truth for author
                ownership.
              </p>
              <button
                type="button"
                onClick={requestPublisherAccess}
                disabled={requestingAccess}
                className="btn-primary"
              >
                {requestingAccess ? "Unlocking..." : "Unlock publishing"}
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="section-shell px-5 py-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Authoring
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Compose your next article
            </h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-foreground">
                Title
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="input"
                  placeholder="What I learned debugging stale auth state"
                  disabled={!canPublish || publishing}
                />
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Category
                <input
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className="input"
                  placeholder="Authentication"
                  disabled={!canPublish || publishing}
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm text-foreground">
              Summary
              <textarea
                value={form.summary}
                onChange={(event) => updateField("summary", event.target.value)}
                className="textarea min-h-[7rem]"
                placeholder="A tight summary that helps readers decide whether to dive in."
                disabled={!canPublish || publishing}
              />
            </label>

            <label className="grid gap-2 text-sm text-foreground">
              Article body
              <Editor
                content={form.content}
                onChange={(value) => updateField("content", value)}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="panel-shell grid gap-4 p-5">
              <label className="grid gap-2 text-sm text-foreground">
                Tags
                <input
                  value={form.tags}
                  onChange={(event) => updateField("tags", event.target.value)}
                  className="input"
                  placeholder="nextjs, auth, production"
                  disabled={!canPublish || publishing}
                />
              </label>

              <label className="grid gap-2 text-sm text-foreground">
                Snippet language
                <input
                  value={form.codeLanguage}
                  onChange={(event) =>
                    updateField("codeLanguage", event.target.value)
                  }
                  className="input"
                  placeholder="TypeScript"
                  disabled={!canPublish || publishing}
                />
              </label>

              <div className="grid gap-2 text-sm text-foreground">
                <span>Featured snippet</span>
                <CodeSnippetEditor
                  value={form.codeSnippet}
                  onChange={(value) => updateField("codeSnippet", value)}
                  language={form.codeLanguage}
                  placeholder="Paste a short snippet readers should inspect alongside the article."
                  rows={10}
                />
              </div>

              <CodeSnippetPreview
                code={form.codeSnippet}
                language={form.codeLanguage}
                className="mt-2"
              />

              <button
                type="button"
                onClick={publish}
                disabled={!canPublish || publishing}
                className="btn-primary w-full"
              >
                {publishing ? "Publishing..." : "Publish article"}
              </button>

              {!canPublish && (
                <p className="text-xs leading-6 text-text-muted">
                  Finish publisher setup above to activate publishing.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell px-5 py-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Library
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Your published work
            </h2>
          </div>
          <div className="rounded-full border border-border bg-background/60 px-4 py-2 text-xs text-text-muted">
            {posts.length} total posts
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="panel-shell flex flex-col items-center gap-3 px-6 py-10 text-center">
            <FiFileText className="h-10 w-10 text-primary-500/70" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                No blog posts yet
              </h3>
              <p className="max-w-md text-sm leading-7 text-text-muted">
                Your first article will show up here with quick access to the
                live page.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="panel-shell group grid gap-4 p-5 transition hover:border-primary-500/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    {post.category || "General"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {post.status === "draft" ? "Draft" : "Published"}
                    </span>
                    <button
                      type="button"
                      onClick={() => deletePost(post)}
                      disabled={deletingPostId === post.id}
                      className="rounded-full p-1.5 text-text-muted transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                      aria-label="Delete blog post"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <Link href={`/blogs/${post.id}`} className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary-500">
                    {post.title}
                  </h3>
                  <p className="text-sm leading-7 text-text-muted">
                    {post.summary}
                  </p>
                </Link>
                <div className="flex items-center justify-between gap-4 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-2">
                    <FiClock className="h-3.5 w-3.5" />
                    {post.readTimeMinutes || 1} min read
                  </span>
                  <span>{formatDate(post.updatedAt || post.createdAt)}</span>
                </div>
                <Link
                  href={`/blogs/${post.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-500"
                >
                  Open article <FiArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
