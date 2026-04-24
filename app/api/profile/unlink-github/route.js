import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlinkGithubProfile } from "@/lib/server/userProfiles";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await unlinkGithubProfile(session.user.email);
  return NextResponse.json({ ok: true, profile });
}
