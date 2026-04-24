export const ACHIEVEMENT_DEFINITIONS = {
  first_post: {
    title: "First Post",
    description: "Published your first bug report.",
  },
  prolific_reporter: {
    title: "Bug Reporter",
    description: "Shared 5 bug reports with the community.",
  },
  first_helpful_fix: {
    title: "First Helper",
    description: "Offered your first solution to another user.",
  },
  community_solver: {
    title: "Community Solver",
    description: "Shared 5 solutions for other users.",
  },
  first_resolved_post: {
    title: "First Resolution",
    description: "Marked one of your posts as solved.",
  },
  bug_buster: {
    title: "Bug Buster",
    description: "Resolved 10 posts.",
  },
  first_blog_post: {
    title: "Tech Blogger",
    description: "Published your first blog post.",
  },
  blogger_verified: {
    title: "Verified Blogger",
    description: "Completed blog email and phone verification.",
  },
};

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
