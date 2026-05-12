"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCode, FiFileText, FiPenTool, FiSearch, FiZap } from "react-icons/fi";
import { IoBug } from "react-icons/io5";

const debugLoadingSteps = [
  { icon: FiSearch, label: "Finding reports" },
  { icon: IoBug, label: "Scanning bugs" },
  { icon: FiCode, label: "Preparing fixes" },
];

const blogLoadingSteps = [
  { icon: FiPenTool, label: "Opening workspace" },
  { icon: FiFileText, label: "Collecting articles" },
  { icon: FiCode, label: "Preparing snippets" },
];

const getLoaderVariant = (pathname) => {
  if (pathname === "/") return "debug";
  if (pathname === "/explore") return "debug";
  if (pathname === "/blog" || pathname.startsWith("/blogs/")) return "blog";
  return null;
};

export default function BrowserLoadingScreen() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const variant = getLoaderVariant(pathname || "");
  const [visible, setVisible] = useState(Boolean(variant));
  const isBlog = variant === "blog";
  const loadingSteps = isBlog ? blogLoadingSteps : debugLoadingSteps;

  useEffect(() => {
    if (!variant) {
      setVisible(false);
      return undefined;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), isBlog ? 1000 : 1200);
    return () => window.clearTimeout(timer);
  }, [pathname, variant, isBlog]);

  return (
    <AnimatePresence>
      {visible && variant && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-background px-4 text-foreground"
          role="status"
          aria-live="polite"
          aria-label={isBlog ? "Loading BugReview blogs" : "Loading BugReview"}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: isBlog
                ? "linear-gradient(135deg, rgba(14,165,233,0.12), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent 38%), var(--background)"
                : "radial-gradient(circle at 50% 20%, rgba(14,165,233,0.22), transparent 34%), radial-gradient(circle at 18% 78%, rgba(91,199,2,0.16), transparent 28%), radial-gradient(circle at 84% 72%, rgba(245,158,11,0.16), transparent 28%)",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(rgba(14,165,233,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.1) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage:
                "linear-gradient(to bottom, transparent, black 18%, black 74%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 18%, black 74%, transparent)",
            }}
            animate={
              shouldReduceMotion
                ? undefined
                : { x: [0, -18, 0], y: [0, 12, 0] }
            }
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`relative z-10 flex w-[min(90vw,24rem)] flex-col items-center text-center ${
              isBlog
                ? "section-shell px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
                : ""
            }`}
          >
            <div className="relative mb-6 grid h-24 w-24 place-items-center">
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-full border border-primary-500/25"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { scale: [1, 1.16, 1], opacity: [0.8, 0.25, 0.8] }
                }
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <motion.div
                aria-hidden
                className="absolute inset-2 rounded-full border border-accent-500/25"
                animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className={`relative grid h-16 w-16 place-items-center border border-border bg-surface shadow-[0_20px_60px_rgba(14,165,233,0.18)] ${
                  isBlog ? "rounded-xl" : "rounded-2xl"
                }`}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, -5, 0], rotate: [0, -2, 2, 0] }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {isBlog ? (
                  <FiPenTool className="h-8 w-8 text-primary-500" />
                ) : (
                  <Image
                    src="/bug.png"
                    alt=""
                    width={38}
                    height={38}
                    priority
                    className="h-10 w-10 object-contain"
                  />
                )}
              </motion.div>
              <motion.span
                aria-hidden
                className="absolute right-1 top-2 grid h-7 w-7 place-items-center rounded-full bg-primary-500 text-white shadow-lg"
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.12, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              >
                {isBlog ? (
                  <FiFileText className="h-3.5 w-3.5" />
                ) : (
                  <FiZap className="h-3.5 w-3.5" />
                )}
              </motion.span>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
              {isBlog ? "BugReview Blogs" : "BugReview"}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              {isBlog ? "Loading your writing space" : "Loading your debug feed"}
            </h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-muted">
              {isBlog
                ? "Bringing in articles, drafts, and code notes."
                : "Warming up the community reports, fixes, and fresh clues."}
            </p>

            <div className="mt-7 flex w-full flex-col gap-2">
              {loadingSteps.map(({ icon: Icon, label }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + index * 0.12 }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface/80 px-3 py-2 text-left backdrop-blur"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-primary-500/10 text-primary-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                  <motion.span
                    aria-hidden
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : { opacity: [0.3, 1, 0.3], scale: [0.9, 1.25, 0.9] }
                    }
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.18,
                    }}
                  />
                </motion.div>
              ))}
            </div>

            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full rounded-full bg-primary-500"
                initial={{ width: "12%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.05, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
