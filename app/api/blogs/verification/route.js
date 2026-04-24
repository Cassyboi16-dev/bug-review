import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminDb, updateUserProfile } from "@/lib/server/userProfiles";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.profileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const reason = String(body.reason || "").trim();
  const topics = String(body.topics || "").trim();

  if (!reason || !topics) {
    return NextResponse.json(
      { error: "Reason and topics are required" },
      { status: 400 },
    );
  }

  const requestId = `${session.user.profileId}_${Date.now()}`;
  await adminDb.collection("blogVerificationRequests").doc(requestId).set({
    userId: session.user.profileId,
    email: session.user.email,
    username: session.user.username || session.user.name || "Anonymous",
    reason,
    topics,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  await updateUserProfile(session.user.email, {
    blogVerificationStatus: "pending",
    blogVerificationRequestedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
