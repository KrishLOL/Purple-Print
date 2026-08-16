"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem("weu-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // One-time sync from the inline theme-init script (see themeInitScript
    // below), which already set `data-theme` on <html> before hydration to
    // avoid a flash of the wrong theme. Reading it back here just aligns
    // this component's local state with what's already on screen.
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a DOM attribute set outside React, not a render loop
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="font-num flex items-center gap-2 border border-border px-3 py-1.5 text-xs uppercase tracking-wider text-text-muted transition-colors hover:border-accent hover:text-text"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span
        className="h-2 w-2 border border-current"
        style={{ background: theme === "dark" ? "var(--ink)" : "var(--paper)" }}
        aria-hidden
      />
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}

export const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("weu-theme");
    if (stored === "light") {
      document.documentElement.dataset.theme = "light";
    }
  } catch (e) {}
})();
`;
