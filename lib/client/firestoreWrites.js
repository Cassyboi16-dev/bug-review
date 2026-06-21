"use client";

export function stripUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(stripUndefined);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, stripUndefined(item)]),
  );
}

export function getSignedInUserId(session) {
  return session?.user?.id || session?.user?.profileId || session?.user?.email || "";
}
