"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import toast, { Toaster } from "react-hot-toast";

// Firebase Auth
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/config/firebase.config";

export default function SignIn() {
  const [consent, setConsent] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | register

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/explore");
    }
  }, [session, router]);

  // =========================
  // EMAIL AUTH HANDLER
  // =========================
  const handleEmailAuth = async () => {
    if (!consent) return;

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back 👋");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created 🚀");
      }

      router.push("/explore");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <main className="bg-[#050816] text-white min-h-dvh flex flex-col justify-center items-center px-4">

      <Toaster position="bottom-center" />

      <section className="w-full max-w-md flex flex-col gap-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl font-black">Welcome Back</h1>
          <p className="text-white/70 mt-2 text-sm">
            Sign in to continue sharing and solving bugs
          </p>
        </div>

        {/* EMAIL AUTH SECTION */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-3">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-white text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-white text-black"
          />

          <button
            disabled={!consent}
            onClick={handleEmailAuth}
            className={`py-3 rounded-xl font-semibold transition ${
              consent
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <p
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
            className="text-xs text-center text-emerald-400 cursor-pointer"
          >
            {mode === "login"
              ? "New user? Create account"
              : "Already have an account? Sign in"}
          </p>

        </div>

        {/* CONSENT BOX */}
        <div className="flex items-start gap-3 text-xs text-gray-400 bg-white/5 border border-white/10 p-3 rounded-xl">

          <input
            type="checkbox"
            checked={consent}
            onChange={() => setConsent(!consent)}
            className="mt-1 accent-emerald-500"
          />

          <p>
            I agree to the{" "}
            <Link href="/terms" className="text-emerald-400 hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-emerald-400 hover:underline">
              Privacy Policy
            </Link>.
          </p>

        </div>

        {/* OAUTH SECTION */}
        <div className="flex flex-col gap-3">

          <button
            disabled={!consent}
            onClick={() => signIn("google", { callbackUrl: "/upload" })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${
              consent
                ? "hover:border-emerald-400"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <button
            disabled={!consent}
            onClick={() => signIn("github", { callbackUrl: "/upload" })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${
              consent
                ? "hover:border-emerald-400"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <FaGithub className="text-xl" />
            Continue with GitHub
          </button>

          <button
            disabled={!consent}
            onClick={() => signIn("discord", { callbackUrl: "/upload" })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition ${
              consent
                ? "hover:border-emerald-400"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <FaDiscord className="text-xl" />
            Continue with Discord
          </button>

        </div>

      </section>
    </main>
  );
}