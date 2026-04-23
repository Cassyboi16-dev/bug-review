"use client";

import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/config/firebase.config";
import { collection, getDocs } from "firebase/firestore";
import { HiTrendingUp } from "react-icons/hi";
import {
  FiClock,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiArrowRight,
  FiShare2,
  FiZap,
} from "react-icons/fi";

// ── Country flag util ──────────────────────────
const COUNTRY_CODES = {
  nigeria: "NG",
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  canada: "CA",
  india: "IN",
  germany: "DE",
  france: "FR",
  australia: "AU",
  brazil: "BR",
  "south africa": "ZA",
  ghana: "GH",
  kenya: "KE",
  japan: "JP",
  china: "CN",
};
const toFlagEmoji = (code) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
const getFlag = (name) => {
  if (!name) return "🌍";
  const n = name.trim().toLowerCase();
  const code = COUNTRY_CODES[n];
  return code ? toFlagEmoji(code) : "🌍";
};

const getRelativeTime = (ts) => {
  if (!ts) return "";
  const d = ts?.toDate
    ? ts.toDate()
    : new Date(typeof ts === "number" ? ts : Number(ts));
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const getTrendingScore = (post) => {
  const likes = post.likedBy?.length || 0;
  const saves = post.savedBy?.length || 0;
  const shares = post.shares || 0;
  const views = post.viewedBy?.length || 0;
  const comments = post.comments?.length || 0;
  return likes * 3 + saves * 2 + shares * 2 + comments * 2 + views * 0.5;
};

// ── Ambient background ─────────────────────────
function AmbientBG({ shouldReduceMotion }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%,rgba(14,165,233,0.18),transparent 55%)",
        }}
      />
      <motion.div
        className="absolute inset-x-0 top-0 h-[32rem] opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,165,233,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.12) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "linear-gradient(to bottom,rgba(0,0,0,0.9),transparent 80%)",
          WebkitMaskImage:
            "linear-gradient(to bottom,rgba(0,0,0,0.9),transparent 80%)",
        }}
        animate={
          shouldReduceMotion ? undefined : { x: [0, -20, 0], y: [0, 12, 0] }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      {/* orbs */}
      <motion.div
        className="absolute left-1/2 top-10 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle,rgba(14,165,233,0.38) 0%,rgba(14,165,233,0) 70%)",
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: [1, 1.06, 1], opacity: [0.6, 0.85, 0.6] }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute left-[-6rem] top-[20rem] h-64 w-64 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle,rgba(91,199,2,0.28) 0%,rgba(91,199,2,0) 72%)",
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : { x: [0, 24, 0], y: [0, -16, 0], opacity: [0.3, 0.55, 0.3] }
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-[-4rem] top-[12rem] h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle,rgba(245,158,11,0.26) 0%,rgba(245,158,11,0) 72%)",
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : { x: [0, -20, 0], y: [0, 20, 0], opacity: [0.25, 0.48, 0.25] }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ── Post card ──────────────────────────────────
function PostCard({ post, variant = "default" }) {
  const isTrending = variant === "trending";
  const score = getTrendingScore(post);

  return (
    <div>
      <Link href="/explore" className="block group">
        <div
          className={`bg-surface border rounded-2xl p-4 transition-all duration-200 hover:border-primary-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.08)] ${
            isTrending ? "border-primary-500/40" : "border-border"
          }`}
        >
          {/* ── author row + badges in one flex line ── */}
          <div className="flex items-center gap-2 mb-3 min-w-0">
            <img
              src={
                post.authorImg ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}`
              }
              className="w-7 h-7 rounded-full border border-border object-cover flex-shrink-0"
              alt={post.author}
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">
                {post.author || "Anonymous"}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {getFlag(post.country)} {post.country} ·{" "}
                {getRelativeTime(post.createdAt)}
              </p>
            </div>

            {/* right-side pills — inline, never absolute */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {post.category && (
                <span className="text-[10px] bg-background border border-border text-text-muted px-2 py-0.5 rounded-full leading-none whitespace-nowrap">
                  {post.category}
                </span>
              )}
              {isTrending && (
                <span className="flex items-center gap-1 bg-primary-500/12 text-primary-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-500/25 whitespace-nowrap">
                  <HiTrendingUp className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="hidden sm:inline">Hot</span>
                </span>
              )}
            </div>
          </div>

          {/* content */}
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 mb-1.5 group-hover:text-primary-500 transition-colors">
            {post.title || "Untitled Bug"}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
            {post.description || "No description provided."}
          </p>

          {/* stats footer */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <FiEye className="w-3 h-3" />
              {post.viewedBy?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiHeart className="w-3 h-3" />
              {post.likedBy?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiMessageCircle className="w-3 h-3" />
              {post.comments?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiShare2 className="w-3 h-3" />
              {post.shares || 0}
            </span>
            {isTrending && (
              <span className="ml-auto flex items-center gap-1 text-primary-500 font-semibold">
                <FiZap className="w-3 h-3" />
                {Math.round(score)} pts
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Skeleton card ──────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-border" />
        <div className="space-y-1.5 flex-1">
          <div className="h-2.5 bg-border rounded w-24" />
          <div className="h-2 bg-border rounded w-16" />
        </div>
      </div>
      <div className="h-3 bg-border rounded w-3/4" />
      <div className="h-2.5 bg-border rounded w-full" />
      <div className="h-2.5 bg-border rounded w-2/3" />
    </div>
  );
}

// ── Main ───────────────────────────────────────
export default function Home() {
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, users: 0, solved: 0 });
  const [activeTab, setActiveTab] = useState("trending"); // mobile tab switcher
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "bugPosts"));
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // trending: top 4 by score (min 1 view)
        const byScore = [...all]
          .filter((p) => (p.viewedBy?.length || 0) >= 1)
          .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
          .slice(0, 4);

        // recent: latest 4 by createdAt
        const byDate = [...all]
          .sort((a, b) => {
            const at = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const bt = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return bt - at;
          })
          .slice(0, 4);

        setTrending(byScore);
        setRecent(byDate);

        // community stats
        const uniqueAuthors = new Set(all.map((p) => p.authorId || p.author))
          .size;
        const totalComments = all.reduce(
          (s, p) => s + (p.comments?.length || 0),
          0,
        );
        setStats({
          posts: all.length,
          users: uniqueAuthors,
          solved: totalComments,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <AmbientBG shouldReduceMotion={shouldReduceMotion} />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative z-10 min-h-[88vh] flex flex-col justify-center items-center text-center px-4 gap-6">
        {/* community pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 text-xs text-text-muted"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Developer community · {loading ? "…" : stats.posts} reports live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]"
        >
          Turn <span className="text-primary-500">Errors</span> Into
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <TypeAnimation
            sequence={[
              "Expertise.",
              2200,
              "Solutions.",
              2200,
              "Confidence.",
              2200,
            ]}
            speed={52}
            repeat={Infinity}
            className="text-5xl md:text-7xl font-black tracking-tight text-foreground/80"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="max-w-lg text-sm md:text-base text-text-muted leading-relaxed"
        >
          A community where developers share real bugs, exchange solutions, and
          grow together. No gatekeeping. Just honest debugging.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Link
            href="/signin"
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-200 hover:scale-[1.03] text-sm"
          >
            Get started free <FiArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 border border-border hover:border-primary-500 text-foreground px-6 py-2.5 rounded-full transition-all duration-200 text-sm"
          >
            Browse the feed
          </Link>
        </motion.div>

        {/* community stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex gap-8 mt-2"
        >
          {[
            { label: "Bug reports", value: loading ? "…" : stats.posts },
            { label: "Contributors", value: loading ? "…" : stats.users },
            { label: "Comments", value: loading ? "…" : stats.solved },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-black text-foreground">{value}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-[11px] uppercase tracking-widest text-text-muted mb-3">
              How it works
            </p>
            <h2 className="text-3xl font-black tracking-tight">
              Simple. Open. Effective.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                icon: "🐛",
                title: "Post your bug",
                desc: "Describe what broke, paste your error, share your environment. Takes 60 seconds.",
              },
              {
                num: "02",
                icon: "💬",
                title: "Get real feedback",
                desc: "Developers who've faced the same issue reply, suggest fixes, and dig into the root cause.",
              },
              {
                num: "03",
                icon: "🚀",
                title: "Ship with confidence",
                desc: "Mark it resolved, learn from it, and help the next developer who hits the same wall.",
              },
            ].map(({ num, icon, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-primary-500 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[11px] font-black text-border group-hover:text-primary-500/40 transition-colors">
                    {num}
                  </span>
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          LIVE FEED — TRENDING + RECENT
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-4 sm:px-6 bg-surface/40 border-t border-border">
        <div className="max-w-6xl mx-auto">
          {/* section header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8"
          >
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Live community feed
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                What's happening now
              </h2>
            </div>
            <Link
              href="/explore"
              className="flex items-center gap-1.5 text-sm text-primary-500 hover:underline self-start sm:self-auto flex-shrink-0"
            >
              View all posts <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* ── Mobile tab switcher (hidden on lg) ── */}
          <div className="flex lg:hidden bg-surface border border-border rounded-xl p-1 mb-6">
            {[
              {
                id: "trending",
                label: "Trending",
                icon: <HiTrendingUp className="w-3.5 h-3.5" />,
              },
              {
                id: "recent",
                label: "Recent",
                icon: <FiClock className="w-3.5 h-3.5" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Desktop: two columns | Mobile: single active tab ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* ── TRENDING column ── */}
            <div
              className={activeTab === "trending" ? "block" : "hidden lg:block"}
            >
              {/* column header — desktop only */}
              <div className="hidden lg:flex items-center gap-2 mb-4">
                <HiTrendingUp className="w-4 h-4 text-primary-500" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Trending
                </h3>
              </div>

              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                ) : trending.length > 0 ? (
                  trending.map((post) => (
                    <PostCard key={post.id} post={post} variant="trending" />
                  ))
                ) : (
                  <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <p className="text-sm text-text-muted">
                      No trending posts yet.
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Posts need at least 1 view to appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── RECENT column ── */}
            <div
              className={activeTab === "recent" ? "block" : "hidden lg:block"}
            >
              {/* column header — desktop only */}
              <div className="hidden lg:flex items-center gap-2 mb-4">
                <FiClock className="w-4 h-4 text-text-muted" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Most Recent
                </h3>
              </div>

              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                ) : recent.length > 0 ? (
                  recent.map((post) => (
                    <PostCard key={post.id} post={post} variant="recent" />
                  ))
                ) : (
                  <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <p className="text-sm text-text-muted">No posts yet.</p>
                    <p className="text-xs text-text-muted mt-1">
                      Be the first to report a bug.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 border-t border-border text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto space-y-5"
        >
          <p className="text-[11px] uppercase tracking-widest text-text-muted">
            Join the community
          </p>
          <h2 className="text-4xl font-black tracking-tight">
            Stop debugging alone.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Thousands of developers share bugs daily. Your next breakthrough
            might already be in the feed.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 hover:gap-3 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-[1.03] text-sm"
          >
            Sign in to post a bug <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p className="font-semibold text-foreground">BugReview</p>
          <div className="flex items-center gap-5">
            <Link
              href="/explore"
              className="hover:text-primary-500 transition-colors"
            >
              Explore
            </Link>

            <Link
              href="/upload"
              className="hover:text-primary-500 transition-colors"
            >
              Post a bug
            </Link>
          </div>
          <p>© {new Date().getFullYear()} BugReview. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
