"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import Avatar from "@mui/material/Avatar";

import { PiUser } from "react-icons/pi";
import { TbMenu } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { FiBell } from "react-icons/fi";

export default function Navbar() {
  const { data: session, status } = useSession();

  const [navOpen, setNavOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const moreRef = useRef(null);

  const mainLinks = [
    { label: "Home", url: "/" },
    ...(session ? [{ label: "Explore", url: "/explore" }] : []),
  ];

  const extraLinks = [
    { label: "About", url: "/about" },
    { label: "Code Tester", url: "/debug" },
    { label: "Post Bug", url: "/upload" },
  ];

  // 🔥 CLOSE DROPDOWN ON OUTSIDE CLICK
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

  if (status === "loading") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/bug.png"
            alt="logo"
            width={32}
            height={32}
            className="rounded-md border border-white/10"
          />
          <span className="text-white font-semibold">BugReview</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          {mainLinks.map((item) => (
            <Link
              key={item.label}
              href={item.url}
              className="hover:text-white transition"
            >
              {item.label}
            </Link>
          ))}

          {/* MORE DROPDOWN */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="hover:text-white transition"
            >
              More
            </button>

            {moreOpen && (
              <div className="absolute top-8 right-0 w-40 bg-[#0a0f2c] border border-white/10 rounded-xl p-2 flex flex-col gap-1">
                {extraLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.url}
                    onClick={() => setMoreOpen(false)} // 🔥 CLOSE ON CLICK
                    className="text-sm text-gray-300 hover:text-white hover:bg-white/5 px-2 py-1 rounded"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/profile">
              <Avatar src={session.user?.image || ""} />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="text-gray-300 hover:text-white flex items-center gap-1"
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
        <div className="md:hidden bg-[#050816] border-t border-white/10 px-4 py-4 flex flex-col gap-4">
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
