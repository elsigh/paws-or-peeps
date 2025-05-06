"use client";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  //{ value: "wacky", label: "Wacky" },
];

export function ThemeSelectorInline() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [selected, setSelected] = useState(theme || "light");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelected(theme || "light");
  }, [theme]);

  const handleChange = async (value: string) => {
    setTheme(value);
    setSelected(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", value);
      localStorage.setItem("themeJustChanged", "true");
    }
    if (user?.id) {
      setLoading(true);
      await fetch("/api/set-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: value }),
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-1">
      {THEMES.map((t) => (
        <button
          key={t.value}
          type="button"
          className={`px-2 py-1 rounded text-xs font-medium transition-colors
            ${selected === t.value ? "bg-rose-500 text-foreground" : "bg-gray-100 dark:bg-gray-800 text-foreground dark:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700"}
            ${loading ? "opacity-50 pointer-events-none" : ""}
          `}
          onClick={() => handleChange(t.value)}
          disabled={loading}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
