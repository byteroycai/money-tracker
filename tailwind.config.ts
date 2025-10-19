import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        income: {
          DEFAULT: "#16a34a"
        },
        expense: {
          DEFAULT: "#dc2626"
        }
      },
      boxShadow: {
        soft: "0 10px 30px -15px rgba(15, 23, 42, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
