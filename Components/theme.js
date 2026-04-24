export const THEME_STORAGE_KEY = "bugreview-theme";
export const THEME_OPTIONS = ["system", "dark", "light"];

export function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveThemePreference(preference) {
  return preference === "system" ? getSystemTheme() : preference;
}

export function applyThemePreference(preference, persist = true) {
  if (typeof document === "undefined") return "light";

  const root = document.documentElement;
  const nextPreference = THEME_OPTIONS.includes(preference)
    ? preference
    : "system";
  const resolvedTheme = resolveThemePreference(nextPreference);

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.dataset.themePreference = nextPreference;
  root.dataset.themeResolved = resolvedTheme;

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("theme-change", {
        detail: { preference: nextPreference, resolvedTheme },
      }),
    );
  }

  return resolvedTheme;
}

export function getStoredThemePreference() {
  if (typeof window === "undefined") return "system";
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEME_OPTIONS.includes(storedTheme) ? storedTheme : "system";
}

export function getThemeInitScript() {
  return `
    (function () {
      try {
        var key = "${THEME_STORAGE_KEY}";
        var stored = window.localStorage.getItem(key);
        var preference = ${JSON.stringify(THEME_OPTIONS)}.includes(stored) ? stored : "system";
        var resolved = preference === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : preference;
        var root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
        root.dataset.themePreference = preference;
        root.dataset.themeResolved = resolved;
      } catch (error) {}
    })();
  `;
}
