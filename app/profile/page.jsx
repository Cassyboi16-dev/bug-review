"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { doc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import { FiArrowRight, FiAward, FiGithub, FiShield, FiUser } from "react-icons/fi";
import { db } from "@/config/firebase.config";
import GitHubBadge from "@/Components/GitHubBadge";
import { getAchievementDetails } from "@/lib/achievements";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [unlinkingGithub, setUnlinkingGithub] = useState(false);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (session === undefined) return;
    if (!session) router.replace("/signin");
  }, [router, session]);

  useEffect(() => {
    if (!session?.user?.profileId) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", session.user.profileId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const nextProfile = { id: snapshot.id, ...snapshot.data() };
        setProfile(nextProfile);
        setUsername(nextProfile.username || session.user.username || "");
      },
    );

    return () => unsubscribe();
  }, [session?.user?.profileId, session?.user?.username]);

  const achievements = useMemo(
    () => getAchievementDetails(profile?.achievements || []),
    [profile?.achievements],
  );

  if (!session) return null;

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/update-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      await update({ username });
      toast.success("Username updated");
    } catch (error) {
      toast.error(error.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkGithub = async () => {
    try {
      setUnlinkingGithub(true);
      const response = await fetch("/api/profile/unlink-github", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to unlink GitHub");
      }

      await update({ githubProfileUrl: "" });
      toast.success("GitHub badge removed");
    } catch (error) {
      toast.error(error.message || "Failed to unlink GitHub");
    } finally {
      setUnlinkingGithub(false);
    }
  };

  return (
    <main className="page-shell space-y-8">
      <section className="hero-shell px-6 py-8 md:px-8 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <span className="eyebrow">
              <FiUser className="h-3.5 w-3.5" />
              Profile
            </span>
            <div className="flex items-center gap-4">
              <img
                src={session.user?.image || "/default-avatar.png"}
                alt={session.user?.name || "User"}
                className="h-16 w-16 rounded-3xl border border-border object-cover"
              />
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                  {profile?.username || session.user?.username || session.user?.name}
                </h1>
                <p className="text-sm text-text-muted">{session.user?.email}</p>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-text-muted">
              Manage your identity, author profile, and contribution milestones from
              one workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Bug posts
              </p>
              <p className="mt-3 text-3xl font-black">{profile?.stats?.postsCount || 0}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Solutions
              </p>
              <p className="mt-3 text-3xl font-black">
                {profile?.stats?.solutionsOfferedCount || 0}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Blog posts
              </p>
              <p className="mt-3 text-3xl font-black">
                {profile?.stats?.blogPostsCount || 0}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Blogging
              </p>
              <p className="mt-3 text-lg font-semibold">
                {profile?.verifiedForBlogging ? "Verified" : "Not active"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="section-shell space-y-5 px-6 py-6">
          <div className="flex items-center gap-2">
            <FiGithub className="h-4 w-4 text-primary-500" />
            <h2 className="text-xl font-semibold text-foreground">Identity</h2>
          </div>

          <GitHubBadge
            href={profile?.githubProfileUrl || session.user?.githubProfileUrl}
            username={profile?.githubUsername || session.user?.githubUsername}
          />

          {profile?.githubProfileUrl && (
            <button
              type="button"
              onClick={handleUnlinkGithub}
              disabled={unlinkingGithub}
              className="btn-outline w-full"
            >
              {unlinkingGithub ? "Unlinking..." : "Unlink GitHub"}
            </button>
          )}

          <div className="panel-shell space-y-3 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Blogging access
            </p>
            <p className="text-sm leading-7 text-text-muted">
              {profile?.verifiedForBlogging
                ? "Your account can publish articles and shows the blogger badge."
                : "Complete publisher setup to unlock technical articles and blogger badges."}
            </p>
            <Link href="/blog" className="btn-primary w-full">
              {profile?.verifiedForBlogging ? "Open blog workspace" : "Unlock blogging"}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="btn-outline w-full text-red-400"
          >
            Sign out
          </button>
        </div>

        <div className="section-shell space-y-6 px-6 py-6">
          <div className="flex items-center gap-2">
            <FiShield className="h-4 w-4 text-primary-500" />
            <h2 className="text-xl font-semibold text-foreground">Account settings</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-foreground">
              Name
              <input
                type="text"
                value={session.user?.name || ""}
                disabled
                className="input opacity-70"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Email
              <input
                type="email"
                value={session.user?.email || ""}
                disabled
                className="input opacity-70"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm text-foreground">
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="input"
            />
          </label>

          <div className="panel-shell space-y-3 p-5">
            <div className="flex items-center gap-2">
              <FiAward className="h-4 w-4 text-primary-500" />
              <p className="text-sm font-semibold text-foreground">Achievements</p>
            </div>
            {achievements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement) => (
                  <span
                    key={achievement.key}
                    className="rounded-full border border-primary-500/20 bg-primary-500/8 px-3 py-1 text-xs font-medium text-primary-500"
                  >
                    {achievement.title}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-text-muted">
                Your first milestone appears as soon as you post, help, or publish.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleUpdateUsername}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Saving..." : "Save username"}
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
