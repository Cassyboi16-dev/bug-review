"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord, FaGithub } from "react-icons/fa";

export default function SignIn() {
  const [consent, setConsent] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);

  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/explore");
    }
  }, [status, router]);

  const handleOAuth = async (provider) => {
    if (!consent) {
      toast.error("Have you accepted Terms & Privacy.");
      return;
    }

    try {
      setLoadingProvider(provider);

      await signIn(provider, {
        callbackUrl: "/explore",
      });
    } catch (err) {
      console.error(err);
      toast.error("Authentication failed. Try again.");
      setLoadingProvider(null);
    }
  };

  return (
    <main className="page-shell flex min-h-[calc(100dvh-8rem)] items-center justify-center">
      <Toaster position="bottom-center" />

      <section className="hero-shell w-full max-w-md p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-4xl font-black text-primary-500">
              Welcome Back
            </h1>
            <p className="text-text-muted mt-2 text-sm">
              Sign in to join the community.
            </p>
          </div>

          <div className="flex gap-3 rounded-xl border border-border bg-surface p-3 text-xs">
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
              <Link
                href="/privacy"
                className="text-primary-500 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleOAuth("google")}
              disabled={!consent || loadingProvider}
              className="btn-secondary w-full disabled:opacity-60"
            >
              <FcGoogle />
              {loadingProvider === "google"
                ? "Connecting..."
                : "Continue with Google"}
            </button>

            <button
              onClick={() => handleOAuth("github")}
              disabled={!consent || loadingProvider}
              className="btn-secondary w-full disabled:opacity-60"
            >
              <FaGithub />
              {loadingProvider === "github"
                ? "Connecting..."
                : "Continue with GitHub"}
            </button>

            <button
              onClick={() => handleOAuth("discord")}
              disabled={!consent || loadingProvider}
              className="btn-secondary w-full disabled:opacity-60"
            >
              <FaDiscord />
              {loadingProvider === "discord"
                ? "Connecting..."
                : "Continue with Discord"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
