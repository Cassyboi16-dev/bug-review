"use client";

import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/config/firebase.config";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBugs = async () => {
    try {
      const snapshot = await getDocs(collection(db, "bugPosts"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBugs(data.slice(0, 3)); // show only latest 3
    } catch (err) {
      console.error("Error fetching bugs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* HERO (unchanged - already good) */}
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black"
        >
          Turn <span className="text-emerald-400">Errors</span> Into
        </motion.h1>

        <TypeAnimation
          sequence={["Expertise", 2000, "Solutions", 2000, "Confidence", 2000]}
          speed={50}
          repeat={Infinity}
          className="text-4xl md:text-6xl font-bold mt-3"
        />

        <p className="mt-6 max-w-xl text-white/70">
          Share bugs. Get solutions. Learn faster with developers solving real problems.
        </p>

        <div className="flex gap-4 mt-6">
          <Link href="/signin" className="bg-emerald-500 px-6 py-3 rounded-xl hover:scale-110 transition-all duration-200">
            Get Started
          </Link>
          <Link href="/explore" className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all duration-200">
            Explore Bugs
          </Link>
        </div>
      </section>

      {/* ⚙️ HOW IT WORKS (unchanged visually) */}
      <section className="py-20 px-6 bg-[#020617]">
        <h2 className="text-3xl text-center font-bold mb-10">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            Post Bugs
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            Get Feedback
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            Improve Fast
          </div>
        </div>
      </section>

      {/* 🚀 LIVE BUG FEED (NOW FIREBASE POWERED) */}
      <section className="py-20 px-6">
        <h2 className="text-3xl text-center font-bold mb-10">
          Live Bug Feed 🔴
        </h2>

        <div className="max-w-4xl mx-auto space-y-4">

          {loading && (
            <div className="text-center text-gray-400">
              Loading latest bugs...
            </div>
          )}

          {!loading && bugs.length === 0 && (
            <div className="text-center text-gray-400">
              No bugs yet — be the first to post 🚀
            </div>
          )}

          {bugs.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
            >
              <h3 className="font-semibold text-lg">
                {item.title || "Untitled Bug"}
              </h3>

              <p className="text-sm text-white/60 mt-1">
                {item.description?.slice(0, 100) || "No description"}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                by {item.author || "Anonymous"}
              </p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* CTA (unchanged) */}
      <section className="py-20 px-6 bg-emerald-600 text-black text-center">
        <h2 className="text-3xl font-bold">Ready to Level Up?</h2>
        <p className="mt-3">Join developers solving real bugs daily.</p>

        <Link
          href="/signin"
          className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-xl"
        >
          Sign In to Post a Bug
        </Link>
      </section>

    </main>
  );
}