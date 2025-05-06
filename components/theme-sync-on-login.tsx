"use client";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeSyncOnLogin() {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (user?.id) {
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("themeJustChanged")
      ) {
        localStorage.removeItem("themeJustChanged");
        return; // Skip this sync
      }
      fetch("/api/profile")
        .then((res) => res.json())
        .then((profile) => {
          if (profile?.theme) {
            setTheme(profile.theme);
            localStorage.setItem("theme", profile.theme);
          }
        });
    }
  }, [user?.id, setTheme]);

  return null;
}
