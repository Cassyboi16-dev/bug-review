import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUserProfile } from "@/lib/server/userProfiles";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const emailVerified =
    body.emailVerified === undefined ? true : Boolean(body.emailVerified);
  const phoneVerified =
    body.phoneVerified === undefined ? true : Boolean(body.phoneVerified);
  const verificationEmail = String(body.email || session.user.email || "").trim();
  const verificationPhone = String(body.phone || "").trim();

  if (!emailVerified) {
    return NextResponse.json(
      { error: "Email must be verified" },
      { status: 400 },
    );
  }

  const profile = await updateUserProfile(session.user.email, {
    emailVerifiedForBlogging: true,
    phoneVerifiedForBlogging: phoneVerified,
    verifiedForBlogging: true,
    bloggerBadge: true,
    blogVerificationStatus: "verified",
    verificationEmail,
    verificationPhone,
  });

  return NextResponse.json({ ok: true, profile });
}
