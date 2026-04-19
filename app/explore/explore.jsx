"use client";

import { db } from "@/config/firebase.config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";

import { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiHeart,
  FiBookmark,
  FiShare2,
  FiCopy,
  FiEye,
  FiThumbsDown,
} from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { BsBookmarkFill } from "react-icons/bs";
import { HiTrendingUp } from "react-icons/hi";

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
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  belgium: "BE",
  switzerland: "CH",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  poland: "PL",
  russia: "RU",
  ukraine: "UA",
  japan: "JP",
  china: "CN",
  "south korea": "KR",
  australia: "AU",
  "new zealand": "NZ",
  brazil: "BR",
  mexico: "MX",
  argentina: "AR",
  "south africa": "ZA",
  egypt: "EG",
  kenya: "KE",
  ghana: "GH",
  singapore: "SG",
  malaysia: "MY",
  thailand: "TH",
  vietnam: "VN",
  philippines: "PH",
  indonesia: "ID",
  pakistan: "PK",
  bangladesh: "BD",
  turkey: "TR",
  "saudi arabia": "SA",
  uae: "AE",
  "united arab emirates": "AE",
  israel: "IL",
  greece: "GR",
  portugal: "PT",
  ireland: "IE",
  austria: "AT",
  "czech republic": "CZ",
  czechia: "CZ",
  hungary: "HU",
  romania: "RO",
  serbia: "RS",
  croatia: "HR",
  slovenia: "SI",
  chile: "CL",
  colombia: "CO",
  peru: "PE",
  venezuela: "VE",
  ecuador: "EC",
  bolivia: "BO",
  paraguay: "PY",
  uruguay: "UY",
};

const toFlagEmoji = (countryCode) =>
  countryCode
    .toUpperCase()
    .replace(
      /./g,
      (char) => String.fromCodePoint(127397 + char.charCodeAt(0)),
    );

export default function Explore({ session }) {
  const userId = session?.user?.id || session?.user?.email || "anonymous";
  const userUsername =
    session?.user?.username || session?.user?.name || "Anonymous";

  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [sortMode, setSortMode] = useState("recent");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bugPosts"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(data);
    });

    return () => unsub();
  }, []);

  const getDateObj = (timestamp) => {
    if (!timestamp) return null;

    if (typeof timestamp === "object") {
      return timestamp.toDate();
    }

    if (typeof timestamp === "number") {
      return new Date(timestamp);
    }

    if (typeof timestamp === "string") {
      const parsed = Number(timestamp);
      return isNaN(parsed) ? null : new Date(parsed);
    }

    return null;
  };

  const getRelativeTime = (dateObj) => {
    if (!dateObj) return "Just now";

    const now = new Date();
    const seconds = Math.floor((now - dateObj) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return "Older";
  };

  // =========================
  // GET COUNTRY FLAG
  // =========================
  const getCountryFlag = (countryName) => {
    if (!countryName || countryName === "Unknown") {
      return String.fromCodePoint(0x1f30d);
    }

    const normalizedCountry = countryName.trim().toLowerCase();

    if (/^[a-z]{2}$/i.test(normalizedCountry)) {
      return toFlagEmoji(normalizedCountry);
    }

    const countryCode = COUNTRY_CODES[normalizedCountry];
    if (countryCode) {
      return toFlagEmoji(countryCode);
    }

    return String.fromCodePoint(0x1f30d);

    if (!countryName || countryName === "Unknown") return "🌍";

    // Map of countries to their flag emojis
    const countryFlags = {
      Nigeria: "🇳🇬",
      "United States": "🇺🇸",
      USA: "🇺🇸",
      "United Kingdom": "🇬🇧",
      UK: "🇬🇧",
      Canada: "🇨🇦",
      India: "🇮🇳",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Spain: "🇪🇸",
      Italy: "🇮🇹",
      Netherlands: "🇳🇱",
      Belgium: "🇧🇪",
      Switzerland: "🇨🇭",
      Sweden: "🇸🇪",
      Norway: "🇳🇴",
      Denmark: "🇩🇰",
      Finland: "🇫🇮",
      Poland: "🇵🇱",
      Russia: "🇷🇺",
      Ukraine: "🇺🇦",
      Japan: "🇯🇵",
      China: "🇨🇳",
      "South Korea": "🇰🇷",
      Australia: "🇦🇺",
      "New Zealand": "🇳🇿",
      Brazil: "🇧🇷",
      Mexico: "🇲🇽",
      Argentina: "🇦🇷",
      "South Africa": "🇿🇦",
      Egypt: "🇪🇬",
      Kenya: "🇰🇪",
      Ghana: "🇬🇭",
      Singapore: "🇸🇬",
      Malaysia: "🇲🇾",
      Thailand: "🇹🇭",
      Vietnam: "🇻🇳",
      Philippines: "🇵🇭",
      Indonesia: "🇮🇩",
      Pakistan: "🇵🇰",
      Bangladesh: "🇧🇩",
      Turkey: "🇹🇷",
      "Saudi Arabia": "🇸🇦",
      UAE: "🇦🇪",
      "United Arab Emirates": "🇦🇪",
      Israel: "🇮🇱",
      Greece: "🇬🇷",
      Portugal: "🇵🇹",
      Ireland: "🇮🇪",
      Austria: "🇦🇹",
      "Czech Republic": "🇨🇿",
      Hungary: "🇭🇺",
      Romania: "🇷🇴",
      Serbia: "🇷🇸",
      Croatia: "🇭🇷",
      Slovenia: "🇸🇮",
      Chile: "🇨🇱",
      Colombia: "🇨🇴",
      Peru: "🇵🇪",
      Venezuela: "🇻🇪",
      Ecuador: "🇪🇨",
      Bolivia: "🇧🇴",
      Paraguay: "🇵🇾",
      Uruguay: "🇺🇾",
    };

    return countryFlags[countryName] || "🌍";
  };

  // =========================
  // LIKE
  // =========================
  const toggleLike = async (post) => {
    const ref = doc(db, "bugPosts", post.id);
    const liked = post.likedBy?.includes(userId);

    try {
      await updateDoc(ref, {
        likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
      });
      toast.success(liked ? "Unliked" : "Liked ❤️", {
        position: "bottom-center",
        duration: 1500,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  // =========================
  // SAVE
  // =========================
  const toggleSave = async (post) => {
    const ref = doc(db, "bugPosts", post.id);
    const saved = post.savedBy?.includes(userId);

    await updateDoc(ref, {
      savedBy: saved ? arrayRemove(userId) : arrayUnion(userId),
    });

    toast.success(saved ? "Unsaved" : "Saved 🔖");
  };

  // =========================
  // SHARE
  // =========================
  const sharePost = async (post) => {
    const url = `${window.location.origin}/explore?post=${post.id}`;

    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }

    await updateDoc(doc(db, "bugPosts", post.id), {
      shares: increment(1),
    });
  };

  // =========================
  // COPY LINK
  // =========================
  const copyLink = async (post) => {
    const url = `${window.location.origin}/explore?post=${post.id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  // =========================
  // TRACK VIEWS
  // =========================
  const trackView = async (post) => {
    if (!post.viewedBy?.includes(userId)) {
      try {
        await updateDoc(doc(db, "bugPosts", post.id), {
          viewedBy: arrayUnion(userId),
        });
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    }
  };

  // =========================
  // CHECK IF TRENDING
  // =========================
  const isTrending = (post) => {
    const totalEngagement =
      (post.likedBy?.length || 0) +
      (post.savedBy?.length || 0) +
      (post.shares || 0);
    return totalEngagement >= 5; // Need at least 5 interactions to show trending
  };

  // =========================
  // RANKING SYSTEM
  // =========================
  const rankedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
      const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
      return bTime - aTime; // Most recent first
    });
  }, [posts]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-center" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto">
        {/* SIDEBAR - FILTERS */}
        <div className="lg:col-span-1 space-y-4">
          {/* SEARCH */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Search Posts</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bugs, features..."
              className="w-full bg-background text-foreground placeholder-text-muted border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* SORT */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Sort By</h3>
            <div className="space-y-2">
              {[
                { value: "recent", label: "Recent" },
                { value: "trending", label: "Trending" },
                { value: "top", label: "Most Liked" },
                { value: "viewed", label: "Most Viewed" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortMode(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sortMode === option.value
                      ? "bg-primary-500 text-white"
                      : "bg-background text-foreground hover:bg-surface"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW SAVED */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
              showSavedOnly
                ? "bg-primary-500 text-white"
                : "bg-surface border border-border text-foreground hover:border-primary-500"
            }`}
          >
            {showSavedOnly ? "✓ Showing Saved" : "View Saved Posts"}
          </motion.button>

          {/* TRENDING TAGS */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <HiTrendingUp className="text-primary-500" />
              Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {["React", "Bug", "Performance", "Security", "UI/UX"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setTopicFilter(tag.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      topicFilter === tag.toLowerCase()
                        ? "bg-primary-500 text-white"
                        : "bg-background text-foreground border border-border hover:border-primary-500"
                    }`}
                  >
                    #{tag}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* MAIN FEED */}
        <div className="lg:col-span-3 space-y-4">
          {/* HEADER */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <h1 className="text-2xl font-bold text-foreground">Bug Feed</h1>
            <p className="text-text-muted text-sm">
              {rankedPosts.length} posts • Discover real bugs and solutions
            </p>
          </div>

          {/* POSTS LIST */}
          {rankedPosts.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {rankedPosts.map((post, idx) => {
                  trackView(post);

                  const liked = post.likedBy?.includes(userId);
                  const saved = post.savedBy?.includes(userId);
                  const dateObj = getDateObj(post.createdAt);
                  const relativeTime = getRelativeTime(dateObj);

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-surface border border-border rounded-lg p-5 space-y-4 hover:border-primary-500 transition"
                    >
                      {/* POST HEADER */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={
                              post.authorImg ||
                              "https://api.dicebear.com/7.x/identicon/svg?seed=" +
                                post.author
                            }
                            className="w-10 h-10 rounded-full border border-border object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground text-sm">
                                {post.author || "Anonymous"}
                              </p>
                              {isTrending(post) && (
                                <span className="bg-primary-500/20 text-primary-500 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                  <HiTrendingUp className="w-3 h-3" />
                                  Trending
                                </span>
                              )}
                            </div>
                            <p className="text-text-muted text-xs">
                              {getCountryFlag(post.country)} {post.country} •{" "}
                              {relativeTime}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* POST CONTENT */}
                      <div className="space-y-2">
                        <h2 className="text-lg font-bold text-foreground">
                          {post.title}
                        </h2>
                        <p className="text-foreground text-sm leading-relaxed line-clamp-3">
                          {post.description}
                        </p>
                      </div>

                      {/* POST STATS */}
                      <div className="flex gap-4 text-xs text-text-muted pt-2 border-t border-border flex-wrap">
                        <button className="flex items-center gap-1 hover:text-primary-500 transition">
                          <FiEye className="w-4 h-4" />
                          <span>{post.viewedBy?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-red-400 transition">
                          <FiHeart className="w-4 h-4" />
                          <span>{post.likedBy?.length || 0}</span>
                        </button>

                        <button className="flex items-center gap-1 hover:text-primary-500 transition">
                          <FiShare2 className="w-4 h-4" />
                          <span>{post.shares || 0}</span>
                        </button>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleLike(post)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                            liked
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              : "bg-background text-foreground hover:bg-surface"
                          }`}
                        >
                          {liked ? (
                            <AiFillHeart className="w-4 h-4" />
                          ) : (
                            <FiHeart className="w-4 h-4" />
                          )}
                          Like
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSave(post)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                            saved
                              ? "bg-primary-500/20 text-primary-500 hover:bg-primary-500/30"
                              : "bg-background text-foreground hover:bg-surface"
                          }`}
                        >
                          <FiBookmark className="w-4 h-4" />
                          Save
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => sharePost(post)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-background text-foreground hover:bg-surface font-semibold text-sm transition"
                        >
                          <FiShare2 className="w-4 h-4" />
                          Share
                        </motion.button>
                      </div>

                      {post.comments && post.comments.length > 0 && (
                        <div className="bg-background rounded-lg p-3 border border-border/50 space-y-2">
                          <p className="text-xs font-semibold text-text-muted">
                            Latest Comments
                          </p>
                          {post.comments.slice(0, 2).map((comment, i) => (
                            <div key={i} className="text-xs">
                              <p className="font-semibold text-foreground">
                                {comment.author}
                              </p>
                              <p className="text-text-muted line-clamp-2">
                                {comment.text}
                              </p>
                            </div>
                          ))}
                          {post.comments.length > 2 && (
                            <p className="text-xs text-primary-500 font-semibold">
                              +{post.comments.length - 2} more comments
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-lg p-12 text-center space-y-3">
              <p className="text-text-muted">
                No posts found. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
