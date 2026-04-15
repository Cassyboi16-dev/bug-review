"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutUs() {
  const sectionVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white px-4 py-16 flex justify-center">

      <div className="max-w-5xl w-full flex flex-col gap-16">

        {/* HERO */}
        <motion.section
          className="text-center space-y-4"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-emerald-400 tracking-widest"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.8 } }}
          >
            {"<About BugReview />"}
          </motion.h1>
          <motion.p className="text-gray-400 max-w-2xl mx-auto">
            The platform where bugs are not just solved — they are understood.
          </motion.p>
        </motion.section>

        {/* WHAT WE DO */}
        <motion.section
          className="grid md:grid-cols-2 gap-10 items-center"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="space-y-4">
            <h2 className="text-2xl font-semibold text-emerald-300">
              What We Do
            </h2>
            <p className="text-gray-400">
              Bug Review is a community-driven platform where users share errors,
              debug code, and learn from real-world technical issues. From simple
              bugs to complex system failures, we provide a space to ask, solve,
              and grow.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-sm text-gray-300"
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
          >
            <p>{"// example"}</p>
            <p>{"Error: Cannot read property 'map' of undefined"}</p>
            <p className="text-emerald-400">{"> solution found ✔"}</p>
          </motion.div>
        </motion.section>

        {/* WHY WE EXIST */}
        <motion.section
          className="space-y-4"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-semibold text-emerald-300">
            Why We Exist
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-gray-400">
            {[
              "Solve real-world errors across devices and platforms",
              "Help users build practical tech understanding",
              "Expose common mistakes developers and users face daily",
            ].map((text, index) => (
              <motion.div
                key={index}
                className="bg-white/5 p-5 rounded-xl border border-white/10"
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
              >
                {text}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* WHO IT'S FOR */}
        <motion.section
          className="space-y-4"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
        >
          <h2 className="text-2xl font-semibold text-emerald-300">
            Who It’s For
          </h2>

          <div className="flex flex-wrap gap-3 text-sm">
            {[
              "Tech Enthusiasts",
              "Beginner Programmers",
              "Everyday Computer Users",
              "Business Owners",
              "Professional Developers",
            ].map((item, index) => (
              <motion.span
                key={index}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(16,185,129,0.2)" }}
                transition={{ duration: 0.3 }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* FEATURES */}
        <motion.section
          className="space-y-6"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
        >
          <h2 className="text-2xl font-semibold text-emerald-300">
            Core Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-gray-400">
            {[
              { title: "Chat Rooms", desc: "Topic-based discussions for focused conversations." },
              { title: "Communities", desc: "Controlled spaces with structured content flow." },
              { title: "Search & Filters", desc: "Find exactly what you need without distractions." },
              { title: "Messages & DMs", desc: "Stay updated and connect with others." },
              { title: "Profiles", desc: "Verified users and transparent identity system." },
              { title: "PeerGroups", desc: "Age-based private groups with safety moderation." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 p-5 rounded-xl border border-white/10"
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
              >
                <h3 className="text-white font-semibold">{feature.title}</h3>
                {feature.desc}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* TRUST / SAFETY */}
        <motion.section
          className="space-y-4"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
        >
          <h2 className="text-2xl font-semibold text-emerald-300">
            Safety & Trust
          </h2>
          <p className="text-gray-400">
            We prioritize user safety through moderation systems, verified
            identities, and structured control over communities. PeerGroups are
            reviewed to ensure a secure and respectful environment.
          </p>
        </motion.section>

        {/* CTA */}
        <motion.section
          className="text-center space-y-4"
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
        >
          <h2 className="text-xl font-semibold text-white">
            Ready to fix your next bug?
          </h2>

          <Link 
            className="px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition"
            whilehover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/signin"
          >
            Join Bug Review
          </Link>

          <p className="text-xs text-gray-500 font-mono mt-6">
            {"// build. break. fix. repeat."}
          </p>
        </motion.section>

      </div>
    </main>
  );
}