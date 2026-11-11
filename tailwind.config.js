/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          grey: "#9e9e9e",
          red: "#e53935",
          green: "#43a047",
          purple: "#8e24aa",
        }
      }
    },
  },
  plugins: [],
}
