import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#05070d",
        panel: "rgba(13, 20, 33, 0.76)",
        line: "rgba(148, 163, 184, 0.18)",
        cyanGlow: "#22d3ee"
      },
      boxShadow: {
        glow: "0 0 32px rgba(34, 211, 238, 0.22)",
        soft: "0 18px 60px rgba(0, 0, 0, 0.32)"
      }
    }
  },
  plugins: []
};

export default config;
