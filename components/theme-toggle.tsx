"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";

const iconBase = "h-4 w-4";

type IconProps = ComponentPropsWithoutRef<"svg">;

function SunIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2m10-10h-2M6 12H4m14.142-7.142-1.414 1.414M7.272 16.728l-1.414 1.414m0-12.728L7.272 7.83m11.314 11.314-1.414-1.414" />
    </svg>
  );
}

function MoonIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.354 15.354A8.001 8.001 0 0 1 8.646 3.646 6.5 6.5 0 1 0 20.354 15.354Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = (theme ?? resolvedTheme) === "dark";

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle color mode"
    >
      {isDark ? <SunIcon className={iconBase} /> : <MoonIcon className={iconBase} />}
      <span>{isDark ? "Light" : "Dark"} mode</span>
    </motion.button>
  );
}
