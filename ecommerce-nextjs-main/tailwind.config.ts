module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#0989FF",
        topHeadingPrimary: "#101f1c",
        topHeadingSecondary: "#021d35",
        pink: "#fd4b6b",
      },
      container: {
        center: true,
        padding: "15px",
      },
    },
  },
  plugins: [],
};
