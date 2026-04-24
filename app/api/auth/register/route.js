import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/server/passwords";
import { registerCredentialUser } from "@/lib/server/userProfiles";

export async function POST(request) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  try {
    const hashed = hashPassword(password);
    const profile = await registerCredentialUser({
      email,
      name,
      passwordHash: hashed.hash,
      passwordSalt: hashed.salt,
      passwordAlgorithm: hashed.algorithm,
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 400 },
    );
  }
}
