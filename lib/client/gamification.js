"use client";

import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import {
  DEFAULT_USER_STATS,
  getAchievementDetails,
  getUnlockedAchievementKeys,
} from "@/lib/achievements";

export async function awardUserProgress(profileId, increments = {}) {
  if (!profileId) return [];

  const ref = doc(db, "users", profileId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists() ? snapshot.data() : {};
    const currentStats = { ...DEFAULT_USER_STATS, ...(current.stats || {}) };
    const nextStats = {
      postsCount: currentStats.postsCount + (increments.postsCount || 0),
      solutionsOfferedCount:
        currentStats.solutionsOfferedCount + (increments.solutionsOfferedCount || 0),
      solvedPostsCount:
        currentStats.solvedPostsCount + (increments.solvedPostsCount || 0),
      blogPostsCount:
        currentStats.blogPostsCount + (increments.blogPostsCount || 0),
      blogVerified:
        currentStats.blogVerified || Boolean(increments.blogVerified),
    };

    const previousKeys = current.achievements || [];
    const nextKeys = getUnlockedAchievementKeys(nextStats);
    const unlockedNow = nextKeys.filter((key) => !previousKeys.includes(key));

    transaction.set(
      ref,
      {
        stats: nextStats,
        achievements: nextKeys,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return getAchievementDetails(unlockedNow);
  });
}
