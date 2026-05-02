import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminDb, getUserProfileByEmail } from "@/lib/server/userProfiles";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.profileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getUserProfileByEmail(session.user.email);
  if (!profile?.verifiedForBlogging) {
    return NextResponse.json(
      { error: "Blog verification required" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const summary = String(body.summary || "").trim();
  const content = String(body.content || "").trim();
  const category = String(body.category || "").trim();
  const tags = Array.isArray(body.tags)
    ? Array.from(new Set(body.tags.map((tag) => String(tag).trim()).filter(Boolean)))
    : [];
  const contentText = stripHtml(content);

  if (!title || !summary || !contentText || !category) {
    return NextResponse.json(
      { error: "Title, summary, category, and content are required" },
      { status: 400 },
    );
  }

  const readTimeMinutes = Math.max(
    1,
    Math.ceil(contentText.split(/\s+/).filter(Boolean).length / 200),
  );

  const createdAt = new Date().toISOString();
  const post = {
    title,
    summary,
    content,
    category,
    tags,
    coverImage: String(body.coverImage || "").trim(),
    codeLanguage: String(body.codeLanguage || "").trim(),
    codeSnippet: String(body.codeSnippet || "").trim(),
    authorId: session.user.profileId,
    author: profile.username || session.user.username || session.user.name,
    authorImg: session.user.image || "",
    authorEmail: session.user.email,
    authorGithubUrl: profile.githubProfileUrl || "",
    authorGithubUsername: profile.githubUsername || "",
    authorDiscordUsername: profile.discordUsername || "",
    authorHasDiscord: (profile.linkedProviders || []).includes("discord"),
    authorIsBlogger: Boolean(profile.bloggerBadge || profile.verifiedForBlogging),
    slug: slugify(title),
    status: body.status === "draft" ? "draft" : "published",
    readTimeMinutes,
    createdAt,
    updatedAt: createdAt,
    views: 0,
    likes: 0,
  };

  const ref = await adminDb.collection("blogPosts").add(post);

  return NextResponse.json({ ok: true, id: ref.id, post: { id: ref.id, ...post } });
}
