"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function GitHubBadge({
  href,
  username,
  className = "",
  compact = false,
}) {
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-muted hover:text-foreground ${className}`.trim()}
    >
      <FaGithub className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
      <span>{username ? `GitHub: ${username}` : "GitHub"}</span>
    </Link>
  );
}
