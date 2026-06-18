import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: "#6b2fb5",
          dark: "#531f95",
        },
        orange: {
          DEFAULT: "#ff6a2b",
          dark: "#e9551a",
        },
        ink: "#2b2b33",
        light: "#f8f7fb",
      },
    },
  },
  plugins: [],
};

export default config;
