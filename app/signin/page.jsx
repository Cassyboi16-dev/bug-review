"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth as firebaseAuth } from "@/config/firebase.config";

export default function SignIn() {
  const [consent, setConsent] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submittingEmailAuth, setSubmittingEmailAuth] = useState(false);

  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/explore");
    }
  }, [status, router]);

  const handleEmailAuth = async () => {
    if (!consent) {
      toast.error("You must accept Terms & Privacy.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required.");
      return;
    }

    if (mode === "register" && password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      setSubmittingEmailAuth(true);
      await setPersistence(firebaseAuth, browserLocalPersistence);

      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(
          firebaseAuth,
          email.trim(),
          password,
        );

        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }

        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim(),
          }),
        }).then(async (response) => {
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Failed to create account");
          }
        });

        await sendEmailVerification(credential.user);
        toast.success("Verification email sent. You can still sign in now.");
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl: "/explore",
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      router.push("/explore");
    } catch (error) {
      toast.error(error.message || "Authentication failed.");
    } finally {
      setSubmittingEmailAuth(false);
    }
  };

  const handleOAuth = async (provider) => {
    if (!consent) {
      toast.error("You must accept Terms & Privacy.");
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

      <section className="hero-shell w-full max-w-md p-6">
        <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-black text-primary-500">Welcome Back</h1>
          <p className="text-text-muted mt-2 text-sm">
            Sign in or create an account to continue
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-2xl border border-border bg-background p-1">
          {[
            { key: "login", label: "Sign in" },
            { key: "register", label: "Create account" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMode(item.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === item.key
                  ? "bg-primary-500 text-white"
                  : "text-text-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

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

        <div className="flex flex-col gap-3">
          {mode === "register" && (
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="input"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="input"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleEmailAuth}
            disabled={!consent || submittingEmailAuth}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submittingEmailAuth
              ? mode === "register"
                ? "Creating account..."
                : "Signing in..."
              : mode === "register"
                ? "Create account with email"
                : "Continue with email"}
          </button>
        </div>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs text-text-muted">
            <span className="bg-surface px-3">or continue with</span>
          </div>
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
