"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEMES = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "wacky", label: "Wacky" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [selected, setSelected] = useState(theme || "dark");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // On mount, check localStorage for a saved theme and apply it
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved && saved !== theme) {
      setTheme(saved);
      setSelected(saved);
    } else {
      setSelected(theme || "dark");
    }
  }, [theme, setTheme]);

  const handleChange = async (value: string) => {
    setTheme(value);
    setSelected(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", value);
    }
    if (user?.id) {
      setLoading(true);
      // Persist theme to user profile
      await fetch("/api/set-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: value }),
      });
      setLoading(false);
    }
  };

  return (
    <Select value={selected} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {THEMES.map((t) => (
          <SelectItem key={t.value} value={t.value}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
