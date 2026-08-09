import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tom: {
          black: "#000000",
          white: "#FFFFFF",
          bg: "#FFFFFF",
          paper: "#F7F6F3",
          sand: "#F2F1ED",
          stone: "#E7E5DF",
          border: "#D2D0CA",
          muted: "#8A8A86",
          darkMuted: "#4B4B48",
          charcoal: "#1B1B1B",
        },
      },
      fontFamily: {
        sans: ["var(--font-alexandria)", "system-ui", "sans-serif"],
        serif: ["var(--font-amiri)", "Georgia", "serif"],
        latin: ["var(--font-cormorant)", "serif"],
      },
      letterSpacing: {
        editorial: "0.25em",
        tightest: "-0.05em",
      },
      height: {
        viewport: "100svh",
      },
    },
  },
  plugins: [],
};

export default config;
