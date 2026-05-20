import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminDb, getUserProfileById } from "@/lib/server/userProfiles";
import { awardUserProgressAdmin } from "@/lib/server/gamification";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.profileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const category = String(body.category || "").trim();
  const country = String(body.country || "").trim();
  const codeLanguage = String(body.codeLanguage || "").trim();
  const codeSnippet = String(body.codeSnippet || "").trim();

  if (!title || title.length < 5 || !description || !category || !country) {
    return NextResponse.json(
      { error: "Title, description, category, and country are required" },
      { status: 400 },
    );
  }

  if (codeSnippet && !codeLanguage) {
    return NextResponse.json(
      { error: "Programming language is required for code snippets" },
      { status: 400 },
    );
  }

  const profile = await getUserProfileById(session.user.profileId);
  const now = new Date();
  const post = {
    title,
    description,
    category,
    country,
    codeLanguage,
    codeSnippet,
    author:
      profile?.username ||
      session.user.username ||
      session.user.name ||
      "Anonymous",
    authorId: session.user.profileId,
    authorEmail: session.user.email,
    authorImg: session.user.image || "/default-avatar.png",
    authorGithubUrl: profile?.githubProfileUrl || "",
    authorGithubUsername: profile?.githubUsername || "",
    authorDiscordUsername: profile?.discordUsername || "",
    authorHasDiscord: (profile?.linkedProviders || []).includes("discord"),
    authorIsBlogger: Boolean(profile?.bloggerBadge || profile?.verifiedForBlogging),
    datestamp: now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    timestamp: now.toLocaleTimeString(),
    createdAt: now.getTime(),
    likedBy: [],
    savedBy: [],
    viewedBy: [session.user.profileId],
    shares: 0,
    comments: [],
    solved: false,
    solvedAt: null,
    solutionText: "",
  };

  const ref = await adminDb.collection("bugPosts").add(post);
  const unlockedAchievements = await awardUserProgressAdmin(session.user.profileId, {
    postsCount: 1,
  });

  return NextResponse.json({
    ok: true,
    id: ref.id,
    post: { id: ref.id, ...post },
    unlockedAchievements,
  });
}
