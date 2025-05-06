"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from "next-themes";
import * as React from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Set theme from localStorage on mount to avoid flash of wrong theme
  const { setTheme } = useTheme();
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) setTheme(saved);
    }
  }, [setTheme]);
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
