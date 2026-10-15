/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Familjen Grotesk"', '"Helvetica Neue"', "Arial", "sans-serif"],
        body: ['"Public Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        ground: "#F6F6F4",
        panel: "#FFFFFF",
        panel2: "#F1F1EE",
        ink: "#1B1F24",
        muted: "#5F6670",
        faint: "#8B929A",
        rule: "#E6E6E2",
        ocean: "#E9EEF0",
        ember: "#E4562A",
        teal: "#2A8C9C",
        gold: "#D9A21B",
        live: "#22A06B",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,31,36,.05), 0 8px 24px rgba(27,31,36,.08)",
        pop: "0 18px 50px rgba(27,31,36,.18)",
      },
    },
  },
  plugins: [],
};
