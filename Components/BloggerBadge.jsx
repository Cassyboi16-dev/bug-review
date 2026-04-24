"use client";

import { HiOutlineSparkles } from "react-icons/hi2";

export default function BloggerBadge({ visible, compact = false }) {
  if (!visible) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ${
        compact ? "" : ""
      }`}
    >
      <HiOutlineSparkles className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
      Blogger
    </span>
  );
}
