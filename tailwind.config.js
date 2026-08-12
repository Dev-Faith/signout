/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6B21A8", // Deep purple
        secondary: "#E9D5FF", // Light lilac
        accent: "#D8B4FE", // Accent purple
        background: "#F8FAFC", // Off-white
        glass: "rgba(255, 255, 255, 0.7)", // Glassmorphism
        glassBorder: "rgba(255, 255, 255, 0.2)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
