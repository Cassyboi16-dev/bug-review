import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUserProfile } from "@/lib/server/userProfiles";

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await request.json();
  const nextUsername = String(username || "").trim();

  if (!nextUsername) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  const profile = await updateUserProfile(session.user.email, {
    username: nextUsername,
  });

  return NextResponse.json({ ok: true, profile });
}
