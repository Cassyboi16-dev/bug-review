"use client";

import Link from "next/link";
import { FaDiscord, FaGithub } from "react-icons/fa";

const PROVIDERS = {
  github: {
    icon: FaGithub,
    label: "GitHub",
    className:
      "border-border bg-surface-muted text-text-muted hover:text-foreground",
  },
  discord: {
    icon: FaDiscord,
    label: "Discord",
    className:
      "border-[#5865F2]/25 bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/15",
  },
};

export default function ProviderBadge({
  provider,
  href,
  username,
  className = "",
  compact = false,
}) {
  const config = PROVIDERS[provider];
  if (!config) return null;

  const Icon = config.icon;
  const content = (
    <>
      <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
      <span>{username ? `${config.label}: ${username}` : config.label}</span>
    </>
  );

  const classes = `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.className} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noreferrer" className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
