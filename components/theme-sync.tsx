"use client";

import { useEffect } from "react";

export function ThemeSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    let theme: string | null = null;

    try {
      const storage = window.localStorage;
      if (storage && typeof storage.getItem === "function") {
        theme = storage.getItem("theme");
      }
    } catch {
      // Ignore storage access issues (private mode, blocked storage, etc).
    }

    if (theme === "light") {
      root.classList.remove("dark");
      return;
    }

    root.classList.add("dark");
  }, []);

  return null;
}
