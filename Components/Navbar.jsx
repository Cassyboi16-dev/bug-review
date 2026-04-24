"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import Avatar from "@mui/material/Avatar";

import { PiUser } from "react-icons/pi";
import { TbMenu } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import {
  THEME_OPTIONS,
  applyThemePreference,
  getStoredThemePreference,
  resolveThemePreference,
} from "@/Components/theme";

function ThemeIcon({ preference, resolvedTheme }) {
  if (preference === "system") return <FiMonitor />;
  return resolvedTheme === "dark" ? <FiMoon /> : <FiSun />;
}

export default function Navbar() {
  const { data: session, status } = useSession();

  const [navOpen, setNavOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [themePreference, setThemePreference] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  const moreRef = useRef(null);

  const mainLinks = [
    { label: "Home", url: "/" },
    ...(session ? [{ label: "Explore", url: "/explore" }] : []),
  ];

  const extraLinks = [
    { label: "About", url: "/about" },
    { label: "Post Bug", url: "/upload" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const preference =
      document.documentElement.dataset.themePreference ||
      getStoredThemePreference();
    const resolved =
      document.documentElement.dataset.themeResolved ||
      resolveThemePreference(preference);

    setThemePreference(preference);
    setResolvedTheme(resolved);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaChange = () => {
      const nextPreference =
        document.documentElement.dataset.themePreference ||
        getStoredThemePreference();

      if (nextPreference !== "system") return;

      const nextResolved = applyThemePreference("system", false);
      setThemePreference("system");
      setResolvedTheme(nextResolved);
    };

    const handleThemeChange = (event) => {
      const detail = event.detail || {};
      setThemePreference(detail.preference || getStoredThemePreference());
      setResolvedTheme(
        detail.resolvedTheme ||
          resolveThemePreference(detail.preference || "system"),
      );
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    window.addEventListener("theme-change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("theme-change", handleThemeChange);
    };
  }, []);

  const setTheme = (nextPreference) => {
    const nextResolved = applyThemePreference(nextPreference);
    setThemePreference(nextPreference);
    setResolvedTheme(nextResolved);
  };

  const cycleTheme = () => {
    const currentIndex = THEME_OPTIONS.indexOf(themePreference);
    const nextPreference =
      THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];
    setTheme(nextPreference);
  };

  if (status === "loading") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/bug.png"
            alt="logo"
            width={32}
            height={32}
            className="rounded-md border border-white/10"
          />
          <span className="text-foreground font-semibold">BugReview</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-text-muted">
          {mainLinks.map((item) => (
            <Link
              key={item.label}
              href={item.url}
              className="hover:text-primary-500 transition"
            >
              {item.label}
            </Link>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="hover:text-foreground transition"
            >
              More
            </button>

            {moreOpen && (
              <div className="absolute top-8 right-0 w-40 bg-surface border border-border rounded-xl p-2 flex flex-col gap-1">
                {extraLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.url}
                    onClick={() => setMoreOpen(false)}
                    className="text-sm text-text-muted hover:text-foreground hover:bg-background px-2 py-1 rounded transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={cycleTheme}
            className="hidden sm:inline-flex items-center justify-center rounded-lg border border-border bg-surface-muted p-2 text-text-muted hover:bg-background hover:text-foreground transition"
            aria-label={`Theme mode: ${themePreference}`}
            title={`Theme mode: ${themePreference}`}
          >
            <ThemeIcon
              preference={themePreference}
              resolvedTheme={resolvedTheme}
            />
          </button>

          {session ? (
            <Link href="/profile">
              <Avatar src={session.user?.image || ""} />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="text-text-muted hover:text-primary-500 pb-2 border-transparent hover:border-primary-500 hover:border-b-2 flex items-center gap-1"
            >
              <PiUser />
              Sign in
            </Link>
          )}

          <button
            onClick={() => setNavOpen(!navOpen)}
            className="md:hidden text-foreground text-xl"
            aria-label="Toggle navigation menu"
          >
            {navOpen ? <IoMdClose /> : <TbMenu />}
          </button>
        </div>
      </div>

      {navOpen && (
        <div className="md:hidden bg-surface border-t border-border px-4 py-4 flex flex-col gap-4">
          {[...mainLinks, ...extraLinks].map((item) => (
            <Link
              key={item.label}
              href={item.url}
              onClick={() => setNavOpen(false)}
              className="text-text-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Theme
            </p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setTheme(option)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition ${
                    themePreference === option
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-border bg-background text-text-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-red-400 text-left"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/upload" })}
              className="text-primary-500 text-left"
            >
              Sign in
            </button>
          )}
        </div>
      )}
    </header>
  );
}
