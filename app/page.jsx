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

      setBugs(data.slice(0, 4)); // show only latest 4
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
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black"
        >
          Turn <span className="text-primary-500">Errors</span> Into
        </motion.h1>

        <TypeAnimation
          sequence={["Expertise", 2000, "Solutions", 2000, "Confidence", 2000]}
          speed={50}
          repeat={Infinity}
          className="text-4xl md:text-6xl font-bold mt-3"
        />

        <p className="mt-6 max-w-xl text-foreground/70">
          Share bugs. Get solutions. Learn faster with developers solving real
          problems.
        </p>

        <div className="flex gap-4 mt-6">
          <Link
            href="/signin"
            className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 hover:scale-105 transition-all duration-200"
          >
            Get Started
          </Link>
          <Link
            href="/explore"
            className="border border-foreground px-6 py-3 rounded-xl hover:bg-surface-muted hover:border-primary-500 transition-all duration-200"
          >
            Explore Bugs
          </Link>
        </div>
      </section>

      <section className="py-20 px-6 bg-surface-muted">
        <h2 className="text-3xl text-center font-bold mb-10 text-foreground">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary-500 transition text-foreground">
            Post Bugs
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary-500 transition text-foreground">
            Get Feedback
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary-500 transition text-foreground">
            Improve Fast
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-background">
        <h2 className="text-3xl text-center font-bold mb-10 text-foreground flex items-center justify-center gap-3">
          Live Bug Feed
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </h2>

        <div className="max-w-4xl mx-auto space-y-4">
          {loading && (
            <div className="text-center text-text-muted">
              Loading latest bugs...
            </div>
          )}

          {!loading && bugs.length === 0 && (
            <div className="text-center text-text-muted">
              No bugs yet — be the first to post 🚀
            </div>
          )}

          {bugs.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-xl p-5 hover:border-primary-500 transition text-foreground"
            >
              <h3 className="font-semibold text-lg">
                {item.title || "Untitled Bug"}
              </h3>

              <p className="text-sm text-text-muted mt-1">
                {item.description?.slice(0, 100) || "No description"}
              </p>

              <p className="text-xs text-text-muted mt-2">
                by {item.author || "Anonymous"}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-primary-500 text-white text-center">
        <h2 className="text-3xl font-bold">Ready to Level Up?</h2>
        <p className="mt-3">Join developers solving real bugs daily.</p>

        <Link
          href="/signin"
          className="inline-block mt-6 bg-foreground text-primary-500 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200"
        >
          Sign In to Post a Bug
        </Link>
      </section>
    </main>
  );
}
