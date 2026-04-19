"use client";

import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/config/firebase.config";
import { collection, getDocs } from "firebase/firestore";

const ambientOrbs = [
  {
    id: "orb-core",
    wrapperClassName: "left-1/2 top-20 -translate-x-1/2",
    className: "h-[22rem] w-[22rem] md:h-[34rem] md:w-[34rem]",
    background:
      "radial-gradient(circle, rgba(14,165,233,0.5) 0%, rgba(14,165,233,0.24) 38%, rgba(14,165,233,0.06) 58%, rgba(14,165,233,0) 74%)",
    animation: {
      x: [0, 18, -14, 0],
      y: [0, -24, 18, 0],
      scale: [1, 1.08, 0.95, 1],
      opacity: [0.82, 1, 0.8, 0.82],
    },
    duration: 15,
  },
  {
    id: "orb-left",
    wrapperClassName: "",
    className:
      "left-[-4rem] top-[16rem] h-64 w-64 md:left-[8%] md:top-[12rem] md:h-80 md:w-80",
    background:
      "radial-gradient(circle, rgba(91,199,2,0.34) 0%, rgba(91,199,2,0.16) 42%, rgba(91,199,2,0) 74%)",
    animation: {
      x: [0, 30, -16, 0],
      y: [0, 26, -12, 0],
      scale: [1, 1.12, 0.94, 1],
      opacity: [0.42, 0.68, 0.46, 0.42],
    },
    duration: 19,
  },
  {
    id: "orb-right",
    wrapperClassName: "",
    className:
      "right-[-3rem] top-[10rem] h-72 w-72 md:right-[6%] md:top-[8rem] md:h-[24rem] md:w-[24rem]",
    background:
      "radial-gradient(circle, rgba(245,158,11,0.34) 0%, rgba(245,158,11,0.16) 40%, rgba(245,158,11,0) 72%)",
    animation: {
      x: [0, -26, 16, 0],
      y: [0, 24, -18, 0],
      scale: [1, 0.92, 1.06, 1],
      opacity: [0.38, 0.62, 0.4, 0.38],
    },
    duration: 18,
  },
];

const orbitRings = [
  {
    id: "ring-large",
    wrapperClassName: "left-1/2 top-[5rem] -translate-x-1/2",
    className: "h-[22rem] w-[22rem] md:h-[34rem] md:w-[34rem]",
    borderColor: "rgba(14,165,233,0.24)",
    animation: {
      rotate: [0, 360],
      scale: [1, 1.04, 1],
      opacity: [0.42, 0.7, 0.42],
    },
    duration: 24,
  },
  {
    id: "ring-small",
    wrapperClassName: "left-1/2 top-[9rem] -translate-x-1/2",
    className: "h-[16rem] w-[16rem] md:h-[24rem] md:w-[24rem]",
    borderColor: "rgba(91,199,2,0.24)",
    animation: {
      rotate: [360, 0],
      scale: [0.96, 1.03, 0.96],
      opacity: [0.26, 0.48, 0.26],
    },
    duration: 20,
  },
];

const sparkDots = [
  {
    id: "dot-left",
    className: "left-[16%] top-[18%] h-3 w-3 md:left-[24%]",
    color: "rgba(14,165,233,0.95)",
    animation: {
      y: [0, -18, 0],
      x: [0, 10, 0],
      scale: [1, 1.8, 1],
      opacity: [0.3, 1, 0.3],
    },
    duration: 5,
  },
  {
    id: "dot-center",
    className: "left-[52%] top-[14%] h-4 w-4",
    color: "rgba(245,158,11,0.95)",
    animation: {
      y: [0, 16, 0],
      x: [0, -12, 0],
      scale: [1, 1.7, 1],
      opacity: [0.35, 0.95, 0.35],
    },
    duration: 4.5,
  },
  {
    id: "dot-right",
    className: "left-[72%] top-[24%] h-3 w-3",
    color: "rgba(91,199,2,0.95)",
    animation: {
      y: [0, -14, 0],
      x: [0, 8, 0],
      scale: [1, 1.6, 1],
      opacity: [0.3, 0.9, 0.3],
    },
    duration: 5.5,
  },
];

const floatingPanels = [
  {
    id: "panel-right",
    className: "right-[9%] top-[16%] h-36 w-36 rotate-12",
    animation: {
      y: [0, -16, 12, 0],
      rotate: [12, 18, 8, 12],
      opacity: [0.14, 0.24, 0.16, 0.14],
    },
    duration: 18,
  },
  {
    id: "panel-left",
    className: "left-[6%] top-[32%] h-24 w-24 -rotate-6",
    animation: {
      y: [0, 14, -10, 0],
      rotate: [-6, -12, -2, -6],
      opacity: [0.1, 0.18, 0.12, 0.1],
    },
    duration: 16,
  },
];

export default function Home() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

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
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 16%, rgba(14,165,233,0.22), transparent 28%), linear-gradient(180deg, rgba(14,165,233,0.08) 0%, rgba(248,249,250,0) 42%)",
          }}
        />

        <div className="absolute left-1/2 top-[2rem] -translate-x-1/2">
          <motion.div
            className="h-[26rem] w-[7rem] rounded-full opacity-80 blur-3xl md:h-[34rem] md:w-[10rem]"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,165,233,0.42) 0%, rgba(14,165,233,0.14) 45%, rgba(14,165,233,0) 100%)",
            }}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, 24, 0],
                    opacity: [0.52, 0.88, 0.52],
                    scaleY: [1, 1.1, 1],
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }
            }
          />
        </div>

        <motion.div
          className="absolute inset-x-[-10%] top-0 h-[34rem] opacity-85"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.16) 1px, transparent 1px)",
            backgroundSize: "96px 96px",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.95), transparent 88%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.95), transparent 88%)",
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -28, 0],
                  y: [0, 18, 0],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 14,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
          }
        />

        {ambientOrbs.map((orb) =>
          orb.wrapperClassName ? (
            <div
              key={orb.id}
              className={`absolute ${orb.wrapperClassName}`}
            >
              <motion.div
                className={`rounded-full blur-3xl ${orb.className}`}
                style={{ background: orb.background }}
                animate={shouldReduceMotion ? { opacity: 0.32 } : orb.animation}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        duration: orb.duration,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                      }
                }
              />
            </div>
          ) : (
            <motion.div
              key={orb.id}
              className={`absolute rounded-full blur-3xl ${orb.className}`}
              style={{ background: orb.background }}
              animate={shouldReduceMotion ? { opacity: 0.32 } : orb.animation}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: orb.duration,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    }
              }
            />
          )
        )}

        {orbitRings.map((ring) => (
          <div
            key={ring.id}
            className={`absolute ${ring.wrapperClassName || ""}`}
          >
            <motion.div
              className={`rounded-full border border-dashed ${ring.className}`}
              style={{ borderColor: ring.borderColor }}
              animate={shouldReduceMotion ? { opacity: 0.36 } : ring.animation}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: ring.duration,
                      repeat: Infinity,
                      ease: "linear",
                    }
              }
            />
          </div>
        ))}

        {sparkDots.map((dot) => (
          <motion.div
            key={dot.id}
            className={`absolute rounded-full shadow-[0_0_24px_currentColor] ${dot.className}`}
            style={{ backgroundColor: dot.color, color: dot.color }}
            animate={shouldReduceMotion ? { opacity: 0.5 } : dot.animation}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: dot.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />
        ))}

        {floatingPanels.map((panel) => (
          <motion.div
            key={panel.id}
            className={`absolute rounded-[2rem] border ${panel.className}`}
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.36), rgba(255,255,255,0.1))",
              borderColor: "rgba(14,165,233,0.22)",
              boxShadow: "0 18px 80px rgba(14,165,233,0.16)",
              backdropFilter: "blur(14px)",
            }}
            animate={shouldReduceMotion ? { opacity: 0.12 } : panel.animation}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: panel.duration,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>

      <section className="relative z-10 min-h-[90vh] flex flex-col justify-center items-center text-center px-4">
        <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            aria-hidden="true"
            className="h-[20rem] w-[min(92vw,48rem)] rounded-[2.5rem] border"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.1))",
              borderColor: "rgba(14,165,233,0.22)",
              boxShadow: "0 30px 120px rgba(14,165,233,0.16)",
              backdropFilter: "blur(16px)",
            }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.72 }
                : {
                    y: [0, -12, 6, 0],
                    opacity: [0.72, 0.9, 0.78, 0.72],
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: 12,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }
            }
          />
        </div>

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

      <section className="relative z-10 py-20 px-6 bg-surface-muted/90">
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

      <section className="relative z-10 py-20 px-6 bg-background/95">
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
              No bugs yet - be the first to post.
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

      <section className="relative z-10 py-20 px-6 bg-primary-500/95 text-white text-center">
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
