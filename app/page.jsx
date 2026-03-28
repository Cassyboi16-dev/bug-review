"use client";

import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="bg-[#0f172a] text-white min-h-dvh relative z-0 ">
      {/* 🔥 HERO */}
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4">
        
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black"
        >
          Turn{" "}
          <span className="text-emerald-400">Errors</span>{" "}
          Into
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-serif"
        >
          <TypeAnimation
            sequence={[
              "Expertise",
              2000,
              "Solutions",
              2000,
              "Confidence",
              2000,
            ]}
            speed={50}
            repeat={Infinity}
            className="text-5xl md:text-7xl font-bold mt-2 font-sans"
          />
        </motion.div>

        <p className="mt-6 max-w-xl text-white/80">
          Share bugs. Get solutions. Learn faster with a community of developers solving real problems.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <Link
            href="/signup"
            className="bg-emerald-500 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Get Started
          </Link>

          <Link
            href="/explore"
            className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
          >
            Explore Bugs
          </Link>
        </div>
      </section>

      {/* ⚙️ HOW IT WORKS */}
      <section className="py-20 px-6 bg-[#020617]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          <div className="bg-white/5 p-6 rounded-xl">
            <h3 className="font-semibold text-xl mb-2">1. Post Bugs</h3>
            <p className="text-white/70">
              Share coding issues or errors you’re facing.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <h3 className="font-semibold text-xl mb-2">2. Get Feedback</h3>
            <p className="text-white/70">
              Developers review and suggest solutions.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <h3 className="font-semibold text-xl mb-2">3. Improve Fast</h3>
            <p className="text-white/70">
              Learn from real-world debugging experiences.
            </p>
          </div>

        </div>
      </section>

      {/* 📊 LIVE PREVIEW */}
      <section className="py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Live Bug Feed
        </h2>

        <div className="max-w-4xl mx-auto bg-white/5 rounded-xl p-6 space-y-4">
          
          <div className="border-b border-white/10 pb-3">
            <p className="font-semibold">React useEffect not working</p>
            <p className="text-sm text-white/60">
              "My state isn't updating after fetch..."
            </p>
          </div>

          <div className="border-b border-white/10 pb-3">
            <p className="font-semibold">Next.js routing issue</p>
            <p className="text-sm text-white/60">
              "Page not found on dynamic route..."
            </p>
          </div>

          <div>
            <p className="font-semibold">CSS not applying</p>
            <p className="text-sm text-white/60">
              "Tailwind classes not showing..."
            </p>
          </div>

        </div>
      </section>

      {/* 🚀 FINAL CTA */}
      <section className="py-20 px-6 bg-emerald-500 text-black text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Level Up?
        </h2>

        <p className="mt-4">
          Join developers solving real bugs every day.
        </p>

        <Link
          href="/signup"
          className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Create Account
        </Link>
      </section>
    </main>
  );
}