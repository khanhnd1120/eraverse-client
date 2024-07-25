/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        panelBg: "#000000",
        activeColor: "#f17d00",
        orange: "#f17d00",
      },
    },
  },
  plugins: [],
};
