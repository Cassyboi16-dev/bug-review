"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PiUser } from "react-icons/pi";
import { TbMenu } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { useSession, signOut, signIn } from "next-auth/react";
import Avatar from "@mui/material/Avatar";
import { FiBell, FiMail, FiBookmark, FiHeart } from "react-icons/fi";
import { HiBellAlert } from "react-icons/hi2";
import { AiOutlineTeam } from "react-icons/ai";
import { redirect } from "next/navigation";


export default function Navbar() {
  const { data: session, status } = useSession();

  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("DMs"); // DMs | Posts | Groups

  if (status === "loading") return null;

  const mainLinks = [
    { label: "Home", url: "/" },
    ...(session ? [{ label: "Explore", url: "/explore" }] : []),
    { label: "Bug Reviews", url: "/bug-reviews" },
  ];

  const extraLinks = [
    { label: "About Us", url: "/about" },
    { label: "Post a Bug", url: "/post" },
    { label: "Upload", url: "/upload" },
  ];

  // Sample notifications
  const notifications = {
    DMs: [
      { id: 1, user: "Jane", text: "Hey, can you help me debug this?", icon: <FiMail className="text-emerald-400" /> },
    ],
    Posts: [
      { id: 2, user: "Alex", text: "Your bug report got a solution!", icon: <HiBellAlert className="text-emerald-400" /> },
    ],
    Groups: [
      { id: 3, group: "Frontend Devs", text: "Check out this new JavaScript bug fix.", icon: <AiOutlineTeam className="text-emerald-400" /> },
    ],
  };

  return (
    <main className="flex items-center justify-between px-4 md:px-6 sticky lg:px-10 py-3 md:py-4 z-50 bg-gradient-to-r from-slate-900 to-slate-950 shadow-md border-b-2">
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

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 relative">
        {mainLinks.map((item, index) => (
          <Link
            key={index}
            href={item.url}
            className="text-white font-medium lg:font-semibold text-sm lg:text-base hover:text-emerald-300 transition"
          >
            {item.label}
          </Link>
        ))}

        {/* Tablet More */}
        <div className="relative hidden md:block lg:hidden">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="text-sm text-white"
          >
            More
          </button>

          {moreOpen && (
            <div className="absolute top-8 right-0 bg-slate-900 shadow-lg rounded-xl p-3 flex flex-col gap-2">
              {extraLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  className={`text-sm ${item.disabled ? "text-gray-500 cursor-not-allowed" : "text-emerald-400"}`
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Large Screens */}
        <div className="hidden lg:flex items-center gap-6">
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
      <div className="flex items-center gap-3 md:gap-4 relative">
        {session ? (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative text-white text-xl p-2 rounded hover:bg-white/10 transition"
              >
                <FiBell />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  {/* Tabs */}
                  <div className="flex border-b border-white/10">
                    {["DMs", "Posts", "Groups"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 text-sm p-2 font-semibold ${
                          activeTab === tab ? "text-emerald-300 border-b-2 border-emerald-300" : "text-gray-400 hover:text-emerald-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-64 overflow-y-auto p-2 flex flex-col gap-2">
                    {(notifications[activeTab] || []).map((n) => (
                      <div key={n.id} className="flex items-start gap-2 p-2 rounded hover:bg-white/5 transition">
                        {n.icon}
                        <div>
                          <p className="text-sm text-white font-semibold">
                            {n.user || n.group}
                          </p>
                          <p className="text-xs text-gray-400">{n.text}</p>
                        </div>
                      </div>
                    ))}
                    {(!notifications[activeTab] || notifications[activeTab].length === 0) && (
                      <p className="text-gray-500 text-xs p-2">No notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Link href="/profile" className="flex items-center gap-3">
                  <Avatar
                    src={session.user?.image || ""}
                    alt={session.user?.name || ""}
                  />
                  <p className="hidden md:block text-white text-sm">
                    {session.user?.name}
                  </p>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <Link href="/signin"
            className="flex items-center gap-1 hover:border-b hover:border-emerald-400 pb-1 transition"
          >
            <p className="hidden md:block text-white text-sm lg:text-base">
              Sign In
            </p>
            <PiUser className="text-white text-lg lg:text-xl" />
          </Link>
        )}

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

        {/* Mobile Auth */}
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="text-white hover:text-red-400"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/upload" })}
            className="text-white hover:text-emerald-400"
          >
            Sign In
          </button>
        )}
      </div>
    </main>
  );
}