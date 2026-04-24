"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/config/firebase.config";
import {
  CodeSnippetEditor,
  CodeSnippetPreview,
} from "@/Components/CodeSnippetBlock";
import { awardUserProgress } from "@/lib/client/gamification";
import {
  RecaptchaVerifier,
  linkWithPhoneNumber,
  reload,
  sendEmailVerification,
} from "firebase/auth";
import { auth as firebaseAuth } from "@/config/firebase.config";

function estimateReadTime(content) {
  return Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200));
}

export default function BlogWorkspace({ session }) {
  const router = useRouter();
  const { update } = useSession();
  const composerRef = useRef(null);
  const recaptchaRef = useRef(null);
  const phoneConfirmationRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [verificationForm, setVerificationForm] = useState({
    reason: "",
    topics: "",
    email: session?.user?.verificationEmail || session?.user?.email || "",
    phone: session?.user?.verificationPhone || "",
    code: "",
  });
  const [blogForm, setBlogForm] = useState({
    title: "",
    summary: "",
    category: "",
    tags: "",
    coverImage: "",
    content: "",
    codeLanguage: "",
    codeSnippet: "",
    status: "published",
  });
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [sendingEmailVerification, setSendingEmailVerification] = useState(false);
  const [sendingPhoneVerification, setSendingPhoneVerification] = useState(false);
  const [confirmingPhoneVerification, setConfirmingPhoneVerification] =
    useState(false);
  const [publishing, setPublishing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    if (!session?.user?.profileId) return;

    const unsubscribeProfile = onSnapshot(
      doc(db, "users", session.user.profileId),
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile({ id: snapshot.id, ...snapshot.data() });
        }
      },
    );

    const unsubscribePosts = onSnapshot(collection(db, "blogPosts"), (snapshot) => {
      const posts = snapshot.docs
        .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
        .filter((post) => post.authorId === session.user.profileId)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setMyPosts(posts);
    });

    return () => {
      unsubscribeProfile();
      unsubscribePosts();
    };
  }, [session?.user?.profileId]);

  const canPublish = Boolean(profile?.verifiedForBlogging);
  const emailVerified =
    profile?.emailVerifiedForBlogging ||
    firebaseAuth.currentUser?.emailVerified ||
    false;
  const phoneVerified = profile?.phoneVerifiedForBlogging || false;
  const readTime = useMemo(
    () => estimateReadTime(blogForm.content),
    [blogForm.content],
  );

  useEffect(() => {
    if (!session?.user?.email) return;

    setVerificationForm((current) => ({
      ...current,
      email: current.email || session.user.email,
      phone: current.phone || session.user.verificationPhone || "",
    }));
  }, [session?.user?.email, session?.user?.verificationPhone]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(
        firebaseAuth,
        "blog-phone-recaptcha",
        {
          size: "invisible",
        },
      );
    }

    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  const handleVerificationRequest = async () => {
    if (
      !verificationForm.reason.trim() ||
      !verificationForm.topics.trim() ||
      !verificationForm.email.trim() ||
      !verificationForm.phone.trim()
    ) {
      toast.error("Please complete the verification form");
      return;
    }

    try {
      setSubmittingVerification(true);
      const response = await fetch("/api/blogs/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: verificationForm.reason,
          topics: verificationForm.topics,
          email: verificationForm.email,
          phone: verificationForm.phone,
        }),
      });

      if (!response.ok) throw new Error("Verification request failed");

      toast.success("Verification request submitted");
      setVerificationForm({ reason: "", topics: "" });
    } catch (error) {
      toast.error("Failed to submit verification request");
      console.error(error);
    } finally {
      setSubmittingVerification(false);
    }
  };

  const sendVerificationEmail = async () => {
    if (!firebaseAuth.currentUser) {
      toast.error("Sign in with email and password to verify your email.");
      return;
    }

    try {
      setSendingEmailVerification(true);
      await sendEmailVerification(firebaseAuth.currentUser);
      toast.success("Verification email sent.");
    } catch (error) {
      toast.error(error.message || "Failed to send email verification.");
    } finally {
      setSendingEmailVerification(false);
    }
  };

  const sendPhoneVerification = async () => {
    if (!firebaseAuth.currentUser) {
      toast.error("Sign in with email and password to verify your phone.");
      return;
    }

    if (!verificationForm.phone.trim()) {
      toast.error("Add your phone number first.");
      return;
    }

    try {
      setSendingPhoneVerification(true);
      phoneConfirmationRef.current = await linkWithPhoneNumber(
        firebaseAuth.currentUser,
        verificationForm.phone.trim(),
        recaptchaRef.current,
      );
      toast.success("Verification code sent to your phone.");
    } catch (error) {
      toast.error(error.message || "Failed to send phone verification.");
    } finally {
      setSendingPhoneVerification(false);
    }
  };

  const confirmPhoneVerification = async () => {
    if (!phoneConfirmationRef.current || !verificationForm.code.trim()) {
      toast.error("Enter the verification code sent to your phone.");
      return;
    }

    try {
      setConfirmingPhoneVerification(true);
      await phoneConfirmationRef.current.confirm(verificationForm.code.trim());
      toast.success("Phone number verified.");
    } catch (error) {
      toast.error(error.message || "Invalid verification code.");
    } finally {
      setConfirmingPhoneVerification(false);
    }
  };

  const completeVerification = async () => {
    try {
      if (!firebaseAuth.currentUser) {
        toast.error("Sign in with email and password to complete verification.");
        return;
      }

      await reload(firebaseAuth.currentUser);
      const response = await fetch("/api/blogs/complete-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailVerified: firebaseAuth.currentUser.emailVerified,
          phoneVerified: Boolean(firebaseAuth.currentUser.phoneNumber),
          email: verificationForm.email,
          phone: verificationForm.phone,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Verification is not complete yet");
      }

      const achievements = await awardUserProgress(session.user.profileId, {
        blogVerified: true,
      });
      achievements.forEach((achievement) =>
        toast.success(`Celebration: ${achievement.title}`),
      );
      await update({
        verifiedForBlogging: true,
      });
      toast.success("Blog verification completed.");
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Failed to complete verification.");
    }
  };

  const handlePublish = async () => {
    if (
      !blogForm.title.trim() ||
      !blogForm.summary.trim() ||
      !blogForm.category.trim() ||
      !blogForm.content.trim()
    ) {
      toast.error("Title, summary, category, and content are required");
      return;
    }

    try {
      setPublishing(true);
      const response = await fetch("/api/blogs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...blogForm,
          tags: blogForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error("Failed to create blog post");

      const data = await response.json();
      const achievements = await awardUserProgress(session.user.profileId, {
        blogPostsCount: 1,
      });
      achievements.forEach((achievement) =>
        toast.success(`Achievement unlocked: ${achievement.title}`),
      );
      toast.success(
        blogForm.status === "draft" ? "Draft saved" : "Blog post published",
      );
      setBlogForm({
        title: "",
        summary: "",
        category: "",
        tags: "",
        coverImage: "",
        content: "",
        codeLanguage: "",
        codeSnippet: "",
        status: "published",
      });

      if (blogForm.status !== "draft") {
        router.push(`/blog/${data.id}`);
      }
    } catch (error) {
      toast.error("Failed to create blog post");
      console.error(error);
    } finally {
      setPublishing(false);
    }
  };

  const openComposer = () => {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-dvh bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                Blog workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold">Write about tech and tech news</h1>
              <p className="mt-2 text-sm text-text-muted">
                Verification is required before publishing so readers can trust technical writeups, references, and news analysis. All blog posts must follow our terms, privacy, copyright, and community guidelines.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!canPublish && (
                <button
                  type="button"
                  onClick={handleVerificationRequest}
                  disabled={
                    submittingVerification ||
                    profile?.blogVerificationStatus === "pending"
                  }
                  className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {profile?.blogVerificationStatus === "pending"
                    ? "Verification pending"
                    : submittingVerification
                      ? "Submitting..."
                      : "Request verification"}
                </button>
              )}

              {canPublish && (
                <button
                  type="button"
                  onClick={openComposer}
                  className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Post a blog
                </button>
              )}
            </div>
          </div>
        </div>

        {!canPublish && (
          <section className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Verification process
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Status: {profile?.blogVerificationStatus || "unverified"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    emailVerified
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-background text-text-muted border border-border"
                  }`}
                >
                  {emailVerified ? "Email verified" : "Email pending"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    phoneVerified
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-background text-text-muted border border-border"
                  }`}
                >
                  {phoneVerified ? "Phone verified" : "Phone pending"}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Verification email
                </label>
                <input
                  type="email"
                  value={verificationForm.email}
                  onChange={(event) =>
                    setVerificationForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={sendVerificationEmail}
                    disabled={sendingEmailVerification || emailVerified}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
                  >
                    {emailVerified
                      ? "Email verified"
                      : sendingEmailVerification
                        ? "Sending..."
                        : "Send email verification"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={verificationForm.phone}
                  onChange={(event) =>
                    setVerificationForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+234..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={sendPhoneVerification}
                    disabled={sendingPhoneVerification || phoneVerified}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
                  >
                    {phoneVerified
                      ? "Phone verified"
                      : sendingPhoneVerification
                        ? "Sending code..."
                        : "Send phone code"}
                  </button>
                  <input
                    type="text"
                    value={verificationForm.code}
                    onChange={(event) =>
                      setVerificationForm((current) => ({
                        ...current,
                        code: event.target.value,
                      }))
                    }
                    placeholder="OTP code"
                    className="min-w-[140px] flex-1 rounded-full border border-border bg-background px-4 py-2 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={confirmPhoneVerification}
                    disabled={confirmingPhoneVerification || phoneVerified}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
                  >
                    {confirmingPhoneVerification
                      ? "Verifying..."
                      : "Verify code"}
                  </button>
                </div>
                <div id="blog-phone-recaptcha" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Why you want to blog
                </label>
                <textarea
                  value={verificationForm.reason}
                  onChange={(event) =>
                    setVerificationForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Topics you will cover
                </label>
                <textarea
                  value={verificationForm.topics}
                  onChange={(event) =>
                    setVerificationForm((current) => ({
                      ...current,
                      topics: event.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-text-muted leading-relaxed">
              By requesting blog access, you confirm that your posts will respect privacy, avoid doxxing or secret leakage, use attributed sources for news, and stay focused on technology-related topics. Blog access unlocks automatically after both your email and phone are verified.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleVerificationRequest}
                disabled={
                  submittingVerification ||
                  profile?.blogVerificationStatus === "pending"
                }
                className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {profile?.blogVerificationStatus === "pending"
                  ? "Verification pending"
                  : submittingVerification
                    ? "Submitting..."
                    : "Request verification"}
              </button>
              <Link
                href="/privacy"
                className="inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
              >
                Review privacy
              </Link>
              <button
                type="button"
                onClick={completeVerification}
                disabled={!emailVerified || !phoneVerified}
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
              >
                Complete verification
              </button>
            </div>
          </section>
        )}

        {canPublish && (
          <section
            ref={composerRef}
            className="rounded-2xl border border-border bg-surface p-6 space-y-5"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  New blog post
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  Estimated read time: {readTime} min
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setBlogForm((current) => ({ ...current, status: "draft" }))
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    blogForm.status === "draft"
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-border"
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBlogForm((current) => ({
                      ...current,
                      status: "published",
                    }))
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    blogForm.status === "published"
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-border"
                  }`}
                >
                  Publish
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Post title"
                value={blogForm.title}
                onChange={(event) =>
                  setBlogForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              />
              <input
                type="text"
                placeholder="Category"
                value={blogForm.category}
                onChange={(event) =>
                  setBlogForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              />
              <input
                type="text"
                placeholder="Tags separated by commas"
                value={blogForm.tags}
                onChange={(event) =>
                  setBlogForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              />
              <input
                type="text"
                placeholder="Cover image URL"
                value={blogForm.coverImage}
                onChange={(event) =>
                  setBlogForm((current) => ({
                    ...current,
                    coverImage: event.target.value,
                  }))
                }
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              />
            </div>

            <textarea
              rows={3}
              placeholder="Short summary for readers and previews"
              value={blogForm.summary}
              onChange={(event) =>
                setBlogForm((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
            />

            <textarea
              rows={12}
              placeholder="Write your article here. You can include references, code fences, and structured analysis."
              value={blogForm.content}
              onChange={(event) =>
                setBlogForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
            />

            <div className="grid md:grid-cols-[220px_1fr] gap-4 items-start">
              <input
                type="text"
                placeholder="Code language"
                value={blogForm.codeLanguage}
                onChange={(event) =>
                  setBlogForm((current) => ({
                    ...current,
                    codeLanguage: event.target.value,
                  }))
                }
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
              />
              <CodeSnippetEditor
                value={blogForm.codeSnippet}
                onChange={(value) =>
                  setBlogForm((current) => ({
                    ...current,
                    codeSnippet: value,
                  }))
                }
                language={blogForm.codeLanguage}
                placeholder="Optional snippet for your article."
                rows={10}
              />
            </div>

            <CodeSnippetPreview
              code={blogForm.codeSnippet}
              language={blogForm.codeLanguage}
            />

            <div className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-text-muted leading-relaxed">
              Publishing confirms that the content is your own or properly attributed, does not expose private user data, and follows the BugReview Terms and Privacy Policy.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {publishing
                  ? "Saving..."
                  : blogForm.status === "draft"
                    ? "Save draft"
                    : "Publish post"}
              </button>
              <Link
                href="/terms"
                className="inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
              >
                Review publishing terms
              </Link>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-foreground">Your blog posts</h2>
            <Link href="/terms" className="text-xs text-primary-500 hover:underline">
              Terms
            </Link>
          </div>

          {myPosts.length > 0 ? (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="block rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground">{post.title}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {post.category} · {post.status} · {post.readTimeMinutes} min read
                      </p>
                    </div>
                    <span className="text-xs text-primary-500">Open</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              No blog posts yet. Once verified, your drafts and published posts will appear here.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
