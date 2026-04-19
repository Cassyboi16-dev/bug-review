"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { GrUploadOption } from "react-icons/gr";
import { GiCheckMark } from "react-icons/gi";
import { MdErrorOutline } from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase.config";

export default function UploadClient({ session }) {
  const author = session?.user?.username || session?.user?.name || "Anonymous";
  const authorId = session?.user?.id || "";
  const authorImg = session?.user?.image || "/default-avatar.png";

  const datestamp = new Date().toLocaleDateString();
  const timestamp = new Date().toLocaleTimeString();

  const [status, setStatus] = useState("idle");
  const [country, setCountry] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [showEmptyPopup, setShowEmptyPopup] = useState(false);

  const successAudioRef = useRef(null);
  const errorAudioRef = useRef(null);

  // =========================
  // GET USER LOCATION
  // =========================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocoding using Nominatim (OpenStreetMap)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();
            const countryName = data.address?.country;

            if (countryName) {
              setCountry(countryName);
            }
          } catch (error) {
            console.error("Error getting country:", error);
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationLoading(false);
        },
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
    country: country,
  };

  const formValid = Yup.object().shape({
    title: Yup.string().min(5).required("*Title is required"),
    description: Yup.string().required("*Description is required"),
    category: Yup.string().required("*Category is required"),
    country: Yup.string().required("*Country is required"),
  });

  return (
    <main className="min-h-dvh bg-background text-foreground px-4 py-12 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl border border-border rounded-3xl p-8 md:p-12 shadow-2xl bg-surface"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-500 mb-3">
            Share Your Bug
          </h1>
          <p className="text-text-muted">
            Share your bug, get solutions, help the community
          </p>
        </motion.div>

        <Formik
          initialValues={initialVal}
          validationSchema={formValid}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            const hasEmptyFields =
              !values.title.trim() ||
              !values.description.trim() ||
              !values.category.trim() ||
              !values.country.trim();

            if (hasEmptyFields) {
              setShowEmptyPopup(true);
              errorAudioRef.current?.play();
              return;
            }

            try {
              setStatus("loading");

              await addDoc(collection(db, "bugPosts"), {
                ...values,
                author,
                authorId,
                authorImg,

                // ✅ KEEP (for display)
                datestamp,
                timestamp,

                // ✅ ADD (CRITICAL FOR EXPLORE PAGE)
                createdAt: serverTimestamp(),

                // ✅ ADD (PREVENT ERRORS)
                likedBy: [],
                savedBy: [],
                viewedBy: [authorId],
                shares: 0,
                comments: [],
              });

              setStatus("success");
              successAudioRef.current?.play();
              resetForm();

              setTimeout(() => setStatus("idle"), 2500);
            } catch (error) {
              console.error(error);

              setStatus("error");
              errorAudioRef.current?.play();

              setTimeout(() => setStatus("idle"), 2500);
            }
          }}
        >
          <Form
            className="flex flex-col gap-8"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.currentTarget.querySelector('button[type="submit"]')?.click();
              }
            }}
          >
            {/* Author Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 bg-surface-muted rounded-2xl p-4 border border-border"
            >
              <img
                src={authorImg}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-500"
              />
              <div>
                <p className="font-semibold text-foreground">{author}</p>
                <p className="text-xs text-text-muted">{datestamp}</p>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-semibold text-foreground mb-2">
                Bug Title
              </label>
              <Field
                name="title"
                placeholder="e.g., React component not re-rendering on state change"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary-500 focus:bg-surface-muted transition-all outline-none text-foreground placeholder-text-muted"
              />
              <ErrorMessage
                name="title"
                component="p"
                className="text-red-400 text-sm mt-1"
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-foreground mb-2">
                Description
              </label>
              <Field name="description">
                {({ field }) => (
                  <textarea
                    {...field}
                    onInput={autoResize}
                    placeholder="Describe your bug, steps to reproduce, expected vs actual behavior..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary-500 focus:bg-surface-muted transition-all outline-none text-foreground placeholder-text-muted resize-none"
                  />
                )}
              </Field>
              <ErrorMessage
                name="description"
                component="p"
                className="text-red-400 text-sm mt-1"
              />
            </motion.div>

            {/* Category & Country Row */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Category
                </label>
                <Field
                  name="category"
                  placeholder="e.g., Frontend, Backend, Database"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary-500 focus:bg-surface-muted transition-all outline-none text-foreground placeholder-text-muted"
                />
                <ErrorMessage
                  name="category"
                  component="p"
                  className="text-red-400 text-sm mt-1"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Location
                  {locationLoading && (
                    <span className="text-text-muted text-xs ml-2">
                      (detecting...)
                    </span>
                  )}
                </label>
                <Field
                  name="country"
                  placeholder={
                    locationLoading ? "Detecting..." : "Your country"
                  }
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary-500 focus:bg-surface-muted transition-all outline-none text-foreground placeholder-text-muted disabled:opacity-50"
                  disabled={locationLoading}
                />
                <ErrorMessage
                  name="country"
                  component="p"
                  className="text-red-400 text-sm mt-1"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-primary-600 transition-all duration-200 disabled:opacity-50"
            >
              <GrUploadOption className="text-lg" />
              {status === "loading" ? "Posting..." : "Post Bug Report"}
            </motion.button>
          </Form>
        </Formik>
      </motion.div>

      <audio ref={successAudioRef} src="/success.mp3" />
      <audio ref={errorAudioRef} src="/buzz.mp3" />

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            {status === "loading" && (
              <p className="text-foreground">Posting...</p>
            )}

            {status === "success" && (
              <div className="text-emerald-500 text-2xl flex flex-col items-center">
                <GiCheckMark className="text-5xl" />
                Bug Posted Successfully
              </div>
            )}

            {status === "error" && (
              <div className="text-red-500 text-2xl flex flex-col items-center">
                <MdErrorOutline className="text-5xl" />
                Nothing To Post
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmptyPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowEmptyPopup(false)}
          >
            <motion.div
              className="bg-surface border border-border rounded-2xl p-8 text-center space-y-4 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MdErrorOutline className="text-5xl text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">
                Nothing To Post
              </h2>
              <p className="text-text-muted">
                Please fill in all required fields to post a bug report.
              </p>
              <button
                onClick={() => setShowEmptyPopup(false)}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
