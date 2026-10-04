/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.js",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Stitch & WhatsApp Theme Design Tokens
        primary: {
          DEFAULT: "#00453d",
          container: "#075e54",
          light: "#128c7e",
          dark: "#00332d",
          fixed: "#a8f0e3",
          "fixed-dim": "#8cd4c7",
          "on-container": "#8dd5c8"
        },
        secondary: {
          DEFAULT: "#006b5f",
          container: "#8cf1e1",
          light: "#26a69a",
          dark: "#004d40",
          fixed: "#8ff4e3",
          "fixed-dim": "#72d8c8",
          "on-container": "#006f64"
        },
        tertiary: {
          DEFAULT: "#00471c",
          container: "#006129",
          fixed: "#25d366",
          "fixed-dim": "#3de273",
          "on-fixed": "#002109",
          "on-container": "#3fe374"
        },
        accent: {
          green: "#25d366",
          teal: "#128c7e",
          blue: "#34b7f1",
          gold: "#e5a700"
        },
        surface: {
          DEFAULT: "#fbf9f8",
          dim: "#dcd9d9",
          bright: "#ffffff",
          container: "#f0eded",
          "container-low": "#f6f3f2",
          "container-high": "#eae8e7",
          "container-highest": "#e4e2e1",
          "container-lowest": "#ffffff",
          variant: "#e4e2e1"
        },
        background: {
          DEFAULT: "#fbf9f8",
          dark: "#111b21"
        },
        outline: {
          DEFAULT: "#6f7976",
          variant: "#bec9c5"
        },
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#3f4946",
        "on-background": "#1b1c1c",
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a"
        }
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
