/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c0d12",
        haze: "#f2f5f2",
        moss: "#0f5132",
        ember: "#c2410c",
        dusk: "#1f2937",
        fog: "#94a3b8",
      },
      boxShadow: {
        glass: "0 10px 30px rgba(15, 23, 42, 0.18)",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Trebuchet MS", "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
}
