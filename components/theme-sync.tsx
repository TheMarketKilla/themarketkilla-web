"use client";

import { useEffect } from "react";

export function ThemeSync() {
  useEffect(() => {
    const theme = window.localStorage?.getItem?.("theme");
    const root = document.documentElement;

    if (theme === "light") {
      root.classList.remove("dark");
      return;
    }

    root.classList.add("dark");
  }, []);

  return null;
}
