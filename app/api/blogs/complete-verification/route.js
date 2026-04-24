import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUserProfile } from "@/lib/server/userProfiles";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const emailVerified = Boolean(body.emailVerified);
  const phoneVerified = Boolean(body.phoneVerified);
  const verificationEmail = String(body.email || session.user.email || "").trim();
  const verificationPhone = String(body.phone || "").trim();

  if (!emailVerified || !phoneVerified) {
    return NextResponse.json(
      { error: "Email and phone must both be verified" },
      { status: 400 },
    );
  }

  const profile = await updateUserProfile(session.user.email, {
    emailVerifiedForBlogging: true,
    phoneVerifiedForBlogging: true,
    verifiedForBlogging: true,
    bloggerBadge: true,
    blogVerificationStatus: "verified",
    verificationEmail,
    verificationPhone,
  });

  return NextResponse.json({ ok: true, profile });
}
