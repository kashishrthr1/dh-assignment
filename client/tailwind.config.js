/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#04060A",
          900: "#070A12",
          800: "#0D1322",
          700: "#131B30",
          600: "#1C2642",
        },
        emerald: {
          accent: "#00F5A0",
          "accent-hover": "#00D084",
        },
        cyan: {
          accent: "#00D2FF",
          "accent-hover": "#00A3FF",
        },
        gold: {
          accent: "#FFB020",
          "accent-hover": "#FF8A00",
        },
        coral: {
          accent: "#FF4D6D",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
