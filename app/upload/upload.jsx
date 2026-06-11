"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { GiCheckMark } from "react-icons/gi";
import { MdErrorOutline } from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { IoMdGlobe } from "react-icons/io";
import { FiArrowRight } from "react-icons/fi";
import { CodeSnippetEditor } from "@/Components/CodeSnippetBlock";
import { awardUserProgress } from "@/lib/client/gamification";
import { FaRegClipboard } from "react-icons/fa6";
import { FcCheckmark } from "react-icons/fc";
import { FcHighPriority } from "react-icons/fc";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { IoConstruct } from "react-icons/io5";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { FaHandshake } from "react-icons/fa";
import { PiWarningOctagonDuotone } from "react-icons/pi";

export default function UploadClient({ session }) {
  const author = session?.user?.username || session?.user?.name || "Anonymous";
  const authorId = session?.user?.id || "";
  const authorImg = session?.user?.image || "/default-avatar.png";
  const authorGithubUrl = session?.user?.githubProfileUrl || "";
  const authorGithubUsername = session?.user?.githubUsername || "";
  const authorDiscordUsername = session?.user?.discordUsername || "";
  const authorHasDiscord = session?.user?.linkedProviders?.includes("discord");
  const authorIsBlogger = Boolean(session?.user?.bloggerBadge);

  const datestamp = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [status, setStatus] = useState("idle");
  const [country, setCountry] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  const successAudioRef = useRef(null);
  const errorAudioRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const countryName = data.address?.country;
            if (countryName) setCountry(countryName);
          } catch {}
          finally { setLocationLoading(false); }
        },
        () => setLocationLoading(false)
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const initialVal = {
    title: "",
    description: "",
    category: "",
    country,
    codeLanguage: "",
    codeSnippet: "",
  };

  const formValid = Yup.object().shape({
    title: Yup.string().min(5).required("Title is required"),
    description: Yup.string().required("Description is required"),
    category: Yup.string().required("Category is required"),
    country: Yup.string().required("Country is required"),
    codeLanguage: Yup.string().when("codeSnippet", {
      is: (codeSnippet) => Boolean(codeSnippet?.trim()),
      then: (schema) =>
        schema.required("Programming language is required for code snippets"),
      otherwise: (schema) => schema,
    }),
  });

  const guidelines = [
    { icon: <FcCheckmark />, title: "Be specific", desc: "Include steps to reproduce, error messages and your environment." },
    { icon: <FaHandshake />, title: "Be respectful", desc: "Treat every member with kindness. No harassment or hate speech." },
    { icon: <HiOutlineDocumentSearch />, title: "Search first", desc: "Check if your bug has already been reported to avoid duplicates." },
    { icon: <MdOutlinePrivacyTip />, title: "Protect privacy", desc: "Never share API keys, passwords, tokens or sensitive data." },
    { icon: <FcHighPriority /> , title: "No spam", desc: "Avoid duplicate posts, excessive promotion or off-topic content." },
    { icon: <IoConstruct />, title: "Stay constructive", desc: "Focus on solutions. Feedback should help, not discourage." },
  ];
       e.preventDefault();
  return (
    <main className="min-h-dvh bg-background text-foreground flex flex-col">

      {/* ── PAGE HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={authorImg}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
              alt={author}
            />
            <span className="text-sm font-medium text-foreground">{author}</span>
            <span className="text-border">·</span>
            <span className="text-xs text-text-muted">{datestamp}</span>
          </div>
          <span className="text-xs text-text-muted hidden sm:block">
            Ctrl + Enter to submit
          </span>
        </div>
      </motion.header>

      {/* ── FORM BODY ── */}
      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-10">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Report a bug
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Help the community by sharing what you found.
          </p>
        </motion.div>

        <Formik
          initialValues={initialVal}
          validationSchema={formValid}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            try {
              setStatus("loading");
              setUnlockedAchievements([]);
              await addDoc(collection(db, "bugPosts"), {
                ...values,
                author,
                authorId,
                authorEmail: session?.user?.email || "",
                authorImg,
                authorGithubUrl,
                authorGithubUsername,
                authorDiscordUsername,
                authorHasDiscord,
                authorIsBlogger,
                datestamp,
                timestamp: new Date().toLocaleTimeString(),
                createdAt: serverTimestamp(),
                likedBy: [],
                savedBy: [],
                viewedBy: [authorId],
                shares: 0,
                comments: [],
                solved: false,
                solvedAt: null,
                solutionText: "",
              });
              const unlocked = await awardUserProgress(
                session?.user?.profileId,
                { postsCount: 1 },
              );
              setUnlockedAchievements(unlocked);
              setStatus("success");
              successAudioRef?.current?.play("/success.mp3");
              resetForm();
              setTimeout(() => setStatus("idle"), 2500);
            } catch {
              setStatus("error");
              errorAudioRef?.current?.play("/buzz.mp3");
              setTimeout(() => setStatus("idle"), 2500);
            }
          }}
        >
          <Form
            className="space-y-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.currentTarget.querySelector('button[type="submit"]')?.click();
              }
            }}
          >
            {/* TITLE */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="border-b border-border py-5"
            >
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                Bug Title
              </label>
              <Field
                name="title"
                placeholder="What's broken? Give it a clear, concise title."
                className="w-full bg-transparent text-foreground placeholder-text-muted text-base outline-none"
              />
              <ErrorMessage
                name="title"
                component="p"
                className="text-red-400 text-xs mt-2"
              />
            </motion.div>

            {/* DESCRIPTION */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="border-b border-border py-5"
            >
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                Description
              </label>
              <Field name="description">
                {({ field }) => (
                  <textarea
                    {...field}
                    onInput={autoResize}
                    placeholder="Steps to reproduce · Expected vs actual behaviour · Error messages · Environment"
                    rows={4}
                    className="w-full bg-transparent text-foreground placeholder-text-muted text-sm leading-relaxed outline-none resize-none"
                  />
                )}
              </Field>
              <ErrorMessage
                name="description"
                component="p"
                className="text-red-400 text-xs mt-2"
              />
            </motion.div>

            {/* CODE SNIPPET */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="border-b border-border py-5 space-y-4"
            >
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                  Programming Language
                </label>
                <Field
                  name="codeLanguage"
                  placeholder="JavaScript, Python, TypeScript..."
                  className="w-full bg-transparent text-foreground placeholder-text-muted text-sm outline-none"
                />
                <ErrorMessage
                  name="codeLanguage"
                  component="p"
                  className="text-red-400 text-xs mt-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                  Code Snippet
                </label>
                <Field name="codeSnippet">
                  {({ field, form }) => (
                    <div>
                      <CodeSnippetEditor
                        value={field.value}
                        onChange={(value) =>
                          form.setFieldValue("codeSnippet", value)
                        }
                        language={form.values.codeLanguage}
                        placeholder="Paste the exact code that is failing or behaving unexpectedly."
                      />
                    </div>
                  )}
                </Field>
              </div>
            </motion.div>

            {/* CATEGORY + COUNTRY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="border-b border-border py-5 grid grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                  Category
                </label>
                <Field
                  name="category"
                  placeholder="Frontend, Backend…"
                  className="w-full bg-transparent text-foreground placeholder-text-muted text-sm outline-none"
                />
                <ErrorMessage
                  name="category"
                  component="p"
                  className="text-red-400 text-xs mt-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
                  Location
                  {locationLoading && (
                    <IoMdGlobe className="w-3 h-3 text-primary-500 animate-spin" />
                  )}
                </label>
                <Field
                  name="country"
                  placeholder={locationLoading ? "Detecting…" : "Your country"}
                  disabled={locationLoading}
                  className="w-full bg-transparent text-foreground placeholder-text-muted text-sm outline-none disabled:opacity-40"
                />
                <ErrorMessage
                  name="country"
                  component="p"
                  className="text-red-400 text-xs mt-2"
                />
              </div>
            </motion.div>

            {/* SUBMIT */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="pt-6 flex items-center justify-between"
            >
              <p className="text-xs text-text-muted">
                By posting you agree to our{" "}
                <button type="button" className="text-primary-500 hover:underline">
                  guidelines
                </button>
                .
              </p>

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={status === "loading"}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Posting…" : "Post"}
                <FiArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </Form>
        </Formik>
      </div>

      {/* ── COMMUNITY GUIDELINES ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border-t border-border bg-surface"
      >
        <div className="max-w-xl mx-auto px-6">
          {/* Toggle row */}
          <button
            type="button"
            onClick={() => setGuidelinesOpen((v) => !v)}
            className="w-full h-12 flex items-center justify-between text-xs text-text-muted hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <span><FaRegClipboard /></span>
              Community guidelines
            </span>
            <motion.span
              animate={{ rotate: guidelinesOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </button>

          {/* Expandable panel */}
          <AnimatePresence>
            {guidelinesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pb-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {guidelines.map(({ icon, title, desc }) => (
                      <div key={title} className="flex items-start gap-3 py-2">
                        <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{title}</p>
                          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-text-muted border-t border-border pt-3 flex items-start">
                   <span className="text-red-600 ml-5 p-2"><PiWarningOctagonDuotone /></span> Violations may result in post removal or account suspension. Repeated offences can lead to a permanent ban.
                  </p>

                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>
                      <button className="text-primary-500 hover:underline">Terms of Service</button>
                      {" · "}
                      <button className="text-primary-500 hover:underline">Privacy Policy</button>
                    </span>
                    <span>© {new Date().getFullYear()} BugReview</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.footer>

      <audio ref={successAudioRef} href="/success.mp3" />
      <audio ref={errorAudioRef} href="/buzz.mp3" />

      {/* ── STATUS OVERLAY ── */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            {status === "loading" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary-500 animate-spin" />
                <p className="text-sm text-text-muted">Posting your report…</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <GiCheckMark className="text-emerald-400 text-xl" />
                </div>
                <p className="text-sm font-semibold text-foreground">Posted successfully</p>
                <p className="text-xs text-text-muted">
                  {unlockedAchievements[0]
                    ? `Achievement unlocked: ${unlockedAchievements[0].title}`
                    : "Your report is now live on the feed."}
                </p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
                  <MdErrorOutline className="text-red-400 text-2xl" />
                </div>
                <p className="text-sm font-semibold text-foreground">Something went wrong</p>
                <p className="text-xs text-text-muted">Please check all fields and try again.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
