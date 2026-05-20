import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminDb } from "@/lib/server/userProfiles";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.profileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const postId = String(body.postId || "").trim();
  if (!postId) {
    return NextResponse.json({ error: "Post id is required" }, { status: 400 });
  }

  const ref = adminDb.collection("blogPosts").doc(postId);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  if (snapshot.data().authorId !== session.user.profileId) {
    return NextResponse.json(
      { error: "You can only delete your own blog posts" },
      { status: 403 },
    );
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
