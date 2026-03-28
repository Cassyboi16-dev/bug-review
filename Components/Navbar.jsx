"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PiUser } from "react-icons/pi";
import { TbMenu } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";

export default function Navbar() {
  const [navOpen, setNavOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const mainLinks = [
    { label: "Home", url: "/home" },
    { label: "Explore", url: "/explore" },
    { label: "Code Reviews", url: "/code-reviews" },
  ];

  const extraLinks = [
    { label: "About Us", url: "/about" },
    { label: "Notifications", url: "/notifications" },
  ];

  return (
    <main className="flex items-center justify-between px-4 md:px-6 lg:px-10 py-3 md:py-4 relative z-50 bg-gradient-to-r from-slate-900 to-slate-950 shadow-md border-b-2">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 z-50">
        <Image
          src="/bug.png"
          alt="logo"
          width={45}
          height={45}
          className="border-2 bg-emerald-400 rounded-xl shadow-md"
        />
        <p className="font-bold text-emerald-300 text-lg md:text-xl lg:text-2xl italic">
          BugReview
        </p>
      </Link>

      {/* Tablet + Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 relative">

        {/* Main links */}
        {mainLinks.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            className="text-white font-medium lg:font-semibold text-sm lg:text-base hover:text-emerald-300 transition"
          >
            {item.label}
          </Link>
        ))}

        {/* More dropdown (ONLY on tablet) */}
        <div className="relative hidden md:block lg:hidden">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="text-white text-sm hover:text-emerald-300"
          >
            More
          </button>

          {moreOpen && (
            <div className="absolute top-8 right-0 bg-slate-900 shadow-lg rounded-xl p-3 flex flex-col gap-2">
              {extraLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  className="text-white text-sm hover:text-emerald-400"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Show ALL links on large screens */}
        <div className="hidden lg:flex gap-6">
          {extraLinks.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className="text-white font-semibold hover:text-emerald-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* Sign In */}
        <Link
          href="#"
          className="flex items-center gap-1 hover:border-b hover:border-emerald-400 pb-1 transition"
        >
          <p className="hidden md:block text-white text-sm lg:text-base">
            Sign In
          </p>
          <PiUser className="text-white text-lg lg:text-xl" />
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setNavOpen(!navOpen)}
          className="text-2xl md:hidden"
        >
          {navOpen ? (
            <IoMdClose className="text-white" />
          ) : (
            <TbMenu className="text-white" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={`absolute top-full left-0 w-full bg-slate-950 md:hidden flex-col items-center gap-6 py-6 rounded-b-2xl shadow-md ${
          navOpen ? "flex" : "hidden"
        }`}
      >
        {[...mainLinks, ...extraLinks].map((item, index) => (
          <Link
            key={index}
            href={item.url}
            onClick={() => setNavOpen(false)}
            className="text-white font-semibold hover:text-emerald-400"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </main>
  );
}