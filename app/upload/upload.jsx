"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { GrUploadOption } from "react-icons/gr";
import { GiCheckMark } from "react-icons/gi";
import { MdErrorOutline } from "react-icons/md";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";

export default function UploadClient({ session }) {
  const author = session?.user?.name || "Anonymous";
  const authorImg = session?.user?.image || "/default-avatar.png";

  const datestamp = new Date().toLocaleDateString();
  const timestamp = new Date().toLocaleTimeString();

  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const successAudioRef = useRef(null);
  const errorAudioRef = useRef(null);

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const initialVal = { title: "", description: "", category: "" };

  const formValid = Yup.object().shape({
    title: Yup.string()
      .min(5, "Title must be at least 5 characters")
      .required("*Title is required"),
    description: Yup.string().required("*Description is required"),
    category: Yup.string().required("*Category is required"),
  });

  return (
    <main className="min-h-dvh bg-[#020617] text-white px-4 py-12 flex justify-center">
      <div className="w-full max-w-3xl border border-white/10 rounded-xl p-6 md:p-10 shadow-2xl bg-[#12131c]/70 backdrop-blur-lg">

        <h1 className="text-3xl md:text-5xl font-bold mb-12 text-center">
          Upload Bug Report
        </h1>

        <Formik
          initialValues={initialVal}
          validationSchema={formValid}
          onSubmit={async (values, { resetForm }) => {
            try {
              setStatus("loading");

              await addDoc(collection(db, "bugPosts"), {
                ...values,
                author,
                authorImg,
                datestamp,
                timestamp,
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
          <Form className="flex flex-col gap-8">

            {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={authorImg}
                alt="author"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{author}</p>
                <p className="text-xs text-gray-400">{datestamp}</p>
                <p className="text-xs text-gray-400">{timestamp}</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label>Title</label>
              <Field
                name="title"
                placeholder="Enter a clear title..."
                className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10"
              />
              <ErrorMessage name="title" component="p" className="text-red-400 text-sm" />
            </div>

            {/* Description */}
            <div>
              <label>Description</label>
              <Field name="description">
                {({ field }) => (
                  <textarea
                    {...field}
                    onInput={autoResize}
                    rows={3}
                    className="w-full px-4 py-6 rounded-xl text-white border-white/10 border"
                  />
                )}
              </Field>
              <ErrorMessage name="description" component="p" className="text-red-400 text-sm" />
            </div>

            {/* Category */}
            <div>
              <label>Category</label>
              <Field
                name="category"
                placeholder="UI, Auth, Performance..."
                className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10"
              />
              <ErrorMessage name="category" component="p" className="text-red-400 text-sm" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 bg-emerald-400 text-black px-6 py-3 rounded-full"
            >
              Post <GrUploadOption />
            </button>

          </Form>
        </Formik>
      </div>

      {/* AUDIO */}
      <audio ref={successAudioRef} src="/public/success.mp3" preload="auto" />
      <audio ref={errorAudioRef} src="/public/buzz.mp3" preload="auto" />

      {/* ANIMATIONS */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            {/* LOADING */}
            {status === "loading" && (
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  className="w-16 h-16 bg-emerald-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                />
                <p>Posting...</p>
              </div>
            )}

            {/* SUCCESS */}
            {status === "success" && (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="bg-[#0f172a] p-10 rounded-2xl flex flex-col items-center gap-4"
              >
                <div className="text-emerald-400 text-6xl">
                  <GiCheckMark />
                </div>
                <p>Bug Posted Successfully</p>
              </motion.div>
            )}

            {/* ERROR */}
            {status === "error" && (
              <motion.div
                animate={{ x: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className="bg-[#0f172a] p-10 rounded-2xl flex flex-col items-center gap-4 border border-red-500"
              >
                <div className="text-red-400 text-6xl">
                  <MdErrorOutline />
                </div>
                <p>Failed to Post Bug</p>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}