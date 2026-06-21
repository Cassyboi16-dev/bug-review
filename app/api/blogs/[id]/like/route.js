import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdminDb } from "@/lib/server/userProfiles";

export async function POST(request, { params }) {
  const { id: postId } = await params;
  const session = await auth();
  const body = await request.json().catch(() => ({}));
  const userId =
    session?.user?.id ||
    session?.user?.profileId ||
    session?.user?.email ||
    body.userId ||
    "";

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!postId) {
    return NextResponse.json({ error: "Missing blog post id" }, { status: 400 });
  }

  const db = getAdminDb();
  const postRef = db.collection("blogPosts").doc(postId);

  const result = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(postRef);
    if (!snapshot.exists) {
      return null;
    }

    const likedBy = snapshot.data().likedBy || [];
    const liked = !likedBy.includes(userId);
    const nextLikedBy = liked
      ? [...likedBy, userId]
      : likedBy.filter((id) => id !== userId);

    transaction.update(postRef, { likedBy: nextLikedBy });

    return {
      liked,
      likes: nextLikedBy.length,
    };
  });

  if (!result) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
