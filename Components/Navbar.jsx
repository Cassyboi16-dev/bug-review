"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import Avatar from "@mui/material/Avatar";

import { PiUser } from "react-icons/pi";
import { TbMenu } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { FiMoon, FiSun } from "react-icons/fi";

export default function Navbar() {
  const { data: session, status } = useSession();

  const [navOpen, setNavOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [theme, setTheme] = useState("system");

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
    const applyTheme = (value) => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");

      if (value === "dark") {
        root.classList.add("dark");
      } else if (value === "light") {
        root.classList.add("light");
      }

      window.localStorage.setItem("bugreview-theme", value);
      window.dispatchEvent(new CustomEvent("theme-change", { detail: value }));
    };

    const storedTheme =
      window.localStorage.getItem("bugreview-theme") || "system";
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(nextTheme);
    window.localStorage.setItem("bugreview-theme", nextTheme);
    window.dispatchEvent(
      new CustomEvent("theme-change", { detail: nextTheme }),
    );
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
              className="hover:text-emerald-400 transition"
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
            onClick={toggleTheme}
            className="hidden sm:inline-flex items-center justify-center rounded-lg border border-border bg-surface-muted p-2 text-text-muted hover:bg-background transition"
            aria-label="Toggle site theme"
            title="Toggle site theme"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {session ? (
            <Link href="/profile">
              <Avatar src={session.user?.image || ""} />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="text-gray-300 hover:text-emerald-400 hover:border-b-2 pb-2 border-transparent hover:border-emerald-400 flex items-center gap-1"
            >
              <PiUser />
              Sign in
            </Link>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="md:hidden text-white text-xl"
          >
            {navOpen ? <IoMdClose /> : <TbMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {navOpen && (
        <div className="md:hidden bg-surface dark:bg-[#050816] border-t border-border px-4 py-4 flex flex-col gap-4">
          {[...mainLinks, ...extraLinks].map((item) => (
            <Link
              key={item.label}
              href={item.url}
              onClick={() => setNavOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              {item.label}
            </Link>
          ))}

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
              className="text-emerald-400 text-left"
            >
              Sign in
            </button>
          )}
        </div>
      )}
    </header>
  );
}
