"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push("/upload");
    }
  }, [session, router]);

  return (
    <main className="bg-[#0f172a] text-white min-h-dvh flex flex-col justify-center items-center gap-6">
      <section className="flex flex-col gap-4 items-center p-3">
        <h1 className="text-4xl md:text-6xl font-black mb-6">
          Welcome Back
        </h1>

        <p className="mb-8 text-white/80 max-md:text-center">
          Sign in to continue sharing and solving bugs with the community.
        </p>

        {/* Email form (optional, not connected yet) */}
        <form className="flex flex-col gap-4 w-full max-w-md">
          <label>Email</label>
          <input
            type="text"
            placeholder="example@gmail.com"
            className="border rounded-xl p-3"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Input your password"
            className="border rounded-xl p-3 bg-white text-black"
          />

          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition hover:scale-105 text-2xl"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-white/80 mt-4">
          Continue With
        </div>

        {/* ✅ OAuth Buttons */}
        <div className="w-full flex items-center justify-center gap-5">

          {/* GOOGLE */}
          <button
            onClick={() =>
              signIn("google", { callbackUrl: "/upload" })
            }
            className="border p-6 text-3xl rounded-full hover:border-emerald-400"
          >
            <FcGoogle />
          </button>

          {/* GITHUB */}
          <button
            onClick={() =>
              signIn("github", { callbackUrl: "/upload" })
            }
            className="border p-6 text-3xl rounded-full hover:border-emerald-400"
          >
            <FaGithub />
          </button>

          {/* DISCORD */}
          <button
            onClick={() =>
              signIn("discord", { callbackUrl: "/upload" })
            }
            className="border p-6 text-3xl rounded-full hover:border-emerald-400"
          >
            <FaDiscord />
          </button>

        </div>
      </section>
    </main>
  );
}