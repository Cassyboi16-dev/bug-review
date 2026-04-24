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
  const verificationEmail = String(body.email || session.user.email || "").trim();
  const verificationPhone = String(body.phone || "").trim();

  if (!reason || !topics || !verificationEmail || !verificationPhone) {
    return NextResponse.json(
      { error: "Reason, topics, email, and phone are required" },
      { status: 400 },
    );
  }

  const requestId = `${session.user.profileId}_${Date.now()}`;
  await adminDb.collection("blogVerificationRequests").doc(requestId).set({
    userId: session.user.profileId,
    email: verificationEmail,
    phone: verificationPhone,
    username: session.user.username || session.user.name || "Anonymous",
    reason,
    topics,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  await updateUserProfile(session.user.email, {
    blogVerificationStatus: "pending",
    blogVerificationRequestedAt: new Date().toISOString(),
    verificationEmail,
    verificationPhone,
  });

  return NextResponse.json({ ok: true });
}
