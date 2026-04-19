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
  const [loadingProvider, setLoadingProvider] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");

  const { data: session, status } = useSession();
  const router = useRouter();

  // =========================
  // SAFE REDIRECT
  // =========================
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/explore");
    }
  }, [status, router]);

  // =========================
  // EMAIL AUTH (DISABLED)
  // =========================
  const handleEmailAuth = async () => {
    if (!consent) {
      toast.error("You must accept Terms & Privacy.");
      return;
    }

    toast("Email/password auth is not enabled.");
  };

  // =========================
  // OAUTH HANDLER
  // =========================
  const handleOAuth = async (provider) => {
    if (!consent) {
      toast.error("You must accept Terms & Privacy.");
      return;
    }

    try {
      setLoadingProvider(provider);

      await signIn(provider, {
        callbackUrl: "/explore", // unified redirect
      });
    } catch (err) {
      console.error(err);
      toast.error("Authentication failed. Try again.");
      setLoadingProvider(null);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-dvh flex justify-center items-center px-4">
      <Toaster position="bottom-center" />

      <section className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-black text-primary-500">
            Welcome Back
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Sign in to continue
          </p>
        </div>

        {/* ================= FORM ================= */}
        <div className="bg-surface border border-border p-4 rounded-xl flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-background border border-border focus:border-primary-500 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-background border border-border focus:border-primary-500 outline-none"
          />

          <button
            onClick={handleEmailAuth}
            disabled={!consent}
            className={`py-3 rounded-xl font-semibold transition ${
              consent
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "opacity-40 cursor-not-allowed bg-surface-muted"
            }`}
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <p
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
            className="text-xs text-center text-primary-500 cursor-pointer hover:underline"
          >
            {mode === "login"
              ? "Don't have an account? Create one"
              : "Already have an account? Sign in"}
          </p>
        </div>

        {/* ================= CONSENT ================= */}
        <div className="flex gap-3 text-xs bg-surface border border-border p-3 rounded-xl">
          <input
            type="checkbox"
            checked={consent}
            onChange={() => setConsent(!consent)}
            className="mt-1 accent-primary-500"
          />

          <p>
            I agree to{" "}
            <Link href="/terms" className="text-primary-500 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary-500 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* ================= OAUTH ================= */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleOAuth("google")}
            disabled={!consent || loadingProvider}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border"
          >
            <FcGoogle />
            {loadingProvider === "google"
              ? "Connecting..."
              : "Continue with Google"}
          </button>

          <button
            onClick={() => handleOAuth("github")}
            disabled={!consent || loadingProvider}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border"
          >
            <FaGithub />
            {loadingProvider === "github"
              ? "Connecting..."
              : "Continue with GitHub"}
          </button>

          <button
            onClick={() => handleOAuth("discord")}
            disabled={!consent || loadingProvider}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border"
          >
            <FaDiscord />
            {loadingProvider === "discord"
              ? "Connecting..."
              : "Continue with Discord"}
          </button>
        </div>
      </section>
    </main>
  );
}