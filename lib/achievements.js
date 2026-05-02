export const ACHIEVEMENT_DEFINITIONS = {
  first_post: {
    title: "First Post",
    description: "Published your first bug report.",
    points: 30,
  },
  prolific_reporter: {
    title: "Signal Builder",
    description: "Shared 5 bug reports with the community.",
    points: 120,
  },
  first_helpful_fix: {
    title: "First Helper",
    description: "Offered your first solution to another user.",
    points: 40,
  },
  community_solver: {
    title: "Fix Mentor",
    description: "Shared 5 solutions for other users.",
    points: 150,
  },
  first_resolved_post: {
    title: "First Resolution",
    description: "Marked one of your posts as solved.",
    points: 50,
  },
  bug_buster: {
    title: "Bug Buster",
    description: "Resolved 10 posts.",
    points: 250,
  },
  first_blog_post: {
    title: "Tech Blogger",
    description: "Published your first blog post.",
    points: 60,
  },
  blogger_verified: {
    title: "Verified Blogger",
    description: "Completed blog email and phone verification.",
    points: 80,
  },
};

export const GAMIFICATION_TRACKS = [
  {
    key: "postsCount",
    label: "Reports",
    unit: "bug reports",
    milestones: [1, 5, 12],
  },
  {
    key: "solutionsOfferedCount",
    label: "Helpers",
    unit: "solutions",
    milestones: [1, 5, 15],
  },
  {
    key: "solvedPostsCount",
    label: "Resolvers",
    unit: "resolved posts",
    milestones: [1, 10, 25],
  },
  {
    key: "blogPostsCount",
    label: "Writers",
    unit: "blog posts",
    milestones: [1, 3, 8],
  },
];

export const DEFAULT_USER_STATS = {
  postsCount: 0,
  solutionsOfferedCount: 0,
  solvedPostsCount: 0,
  blogPostsCount: 0,
};

function hasReached(value, minimum) {
  return Number(value || 0) >= minimum;
}

export function getUnlockedAchievementKeys(stats = {}) {
  const unlocked = [];

  if (hasReached(stats.postsCount, 1)) unlocked.push("first_post");
  if (hasReached(stats.postsCount, 5)) unlocked.push("prolific_reporter");
  if (hasReached(stats.solutionsOfferedCount, 1)) {
    unlocked.push("first_helpful_fix");
  }
  if (hasReached(stats.solutionsOfferedCount, 5)) {
    unlocked.push("community_solver");
  }
  if (hasReached(stats.solvedPostsCount, 1)) {
    unlocked.push("first_resolved_post");
  }
  if (hasReached(stats.solvedPostsCount, 10)) unlocked.push("bug_buster");
  if (hasReached(stats.blogPostsCount, 1)) unlocked.push("first_blog_post");
  if (stats.blogVerified) unlocked.push("blogger_verified");

  return unlocked;
}

export function getAchievementDetails(keys = []) {
  return keys
    .filter((key) => ACHIEVEMENT_DEFINITIONS[key])
    .map((key) => ({ key, ...ACHIEVEMENT_DEFINITIONS[key] }));
}

export function getGamificationSummary(stats = {}, achievementKeys = []) {
  const normalizedStats = { ...DEFAULT_USER_STATS, ...(stats || {}) };
  const achievementDetails = getAchievementDetails(achievementKeys);
  const activityScore =
    (normalizedStats.postsCount || 0) * 3 +
    (normalizedStats.solutionsOfferedCount || 0) * 4 +
    (normalizedStats.solvedPostsCount || 0) * 5 +
    (normalizedStats.blogPostsCount || 0) * 3;
  const achievementScore = achievementDetails.reduce(
    (total, achievement) => total + (achievement.points || 0),
    0,
  );
  const score = activityScore * 10 + achievementScore;
  const level = Math.max(1, Math.floor(score / 120) + 1);
  const levelFloor = (level - 1) * 120;
  const nextLevelAt = level * 120;
  const levelProgress = Math.min(
    100,
    Math.round(((score - levelFloor) / (nextLevelAt - levelFloor)) * 100),
  );

  const tracks = GAMIFICATION_TRACKS.map((track) => {
    const value = Number(normalizedStats[track.key] || 0);
    const nextMilestone =
      track.milestones.find((milestone) => value < milestone) ||
      track.milestones[track.milestones.length - 1];
    const previousMilestone =
      [...track.milestones].reverse().find((milestone) => value >= milestone) ||
      0;
    const progress =
      nextMilestone === previousMilestone
        ? 100
        : Math.min(
            100,
            Math.round(
              ((value - previousMilestone) /
                (nextMilestone - previousMilestone)) *
                100,
            ),
          );

    return {
      ...track,
      value,
      nextMilestone,
      progress,
      remaining: Math.max(0, nextMilestone - value),
    };
  });

  return {
    score,
    level,
    levelProgress,
    nextLevelAt,
    achievements: achievementDetails,
    tracks,
  };
}

export function getInitialUserProfile() {
  return {
    linkedProviders: [],
    achievements: [],
    stats: { ...DEFAULT_USER_STATS },
    githubProfileUrl: "",
    githubUsername: "",
    blogVerificationStatus: "unverified",
    blogVerificationRequestedAt: null,
    verifiedForBlogging: false,
    emailVerifiedForBlogging: false,
    phoneVerifiedForBlogging: false,
    bloggerBadge: false,
    verificationEmail: "",
    verificationPhone: "",
  };
}
