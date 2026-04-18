"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import toast, { Toaster } from "react-hot-toast";

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
    toast.info("Email/password auth disabled. Use OAuth instead.");
  };

  return (
    <main className="bg-background text-foreground min-h-dvh flex flex-col justify-center items-center px-4">
      <Toaster position="bottom-center" />

      <section className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-black text-primary-500">Welcome Back</h1>
          <p className="text-text-muted mt-2 text-sm">
            Sign in to continue sharing and solving bugs
          </p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-background text-foreground border border-border focus:border-primary-500 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-background text-foreground border border-border focus:border-primary-500 outline-none"
          />

          <button
            disabled={!consent}
            onClick={handleEmailAuth}
            className={`py-3 rounded-xl font-semibold transition ${
              consent
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "bg-surface-muted text-foreground cursor-not-allowed opacity-50"
            }`}
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <p
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-xs text-center text-primary-500 cursor-pointer hover:underline"
          >
            {mode === "login"
              ? "Don't have an account? Create one"
              : "Already have an account? Sign in"}
          </p>
        </div>

        <div className="flex items-start gap-3 text-xs text-text-muted bg-surface border border-border p-3 rounded-xl">
          <input
            type="checkbox"
            checked={consent}
            onChange={() => setConsent(!consent)}
            className="mt-1 accent-primary-500"
          />

          <p>
            I agree to the{" "}
            <Link href="/terms" className="text-primary-500 hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary-500 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            disabled={!consent}
            onClick={() => signIn("google", { callbackUrl: "/upload" })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold transition ${
              consent
                ? "bg-surface text-foreground border-border hover:border-primary-500 hover:bg-surface-muted"
                : "opacity-40 cursor-not-allowed bg-surface-muted"
            }`}
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <button
            disabled={!consent}
            onClick={() => signIn("github", { callbackUrl: "/upload" })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold transition ${
              consent
                ? "bg-surface text-foreground border-border hover:border-primary-500 hover:bg-surface-muted"
                : "opacity-40 cursor-not-allowed bg-surface-muted"
            }`}
          >
            <FaGithub className="text-xl" />
            Continue with GitHub
          </button>

          <button
            disabled={!consent}
            onClick={() => signIn("discord", { callbackUrl: "/upload" })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold transition ${
              consent
                ? "bg-surface text-foreground border-border hover:border-primary-500 hover:bg-surface-muted"
                : "opacity-40 cursor-not-allowed bg-surface-muted"
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
