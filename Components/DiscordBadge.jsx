"use client";

import ProviderBadge from "@/Components/ProviderBadge";

export default function DiscordBadge({
  visible = true,
  username,
  className = "",
  compact = false,
}) {
  if (!visible) return null;

  return (
    <ProviderBadge
      provider="discord"
      username={username}
      className={className}
      compact={compact}
    />
  );
}
