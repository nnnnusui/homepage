module.exports = {
  purge: [
    "./src/components/**/*.tsx",
    "./src/pages/**/*.tsx",
    "./public/**/*.html",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      cursor: {
        "resize-v": "ew-resize",
      },
      maxWidth: {
        border: ".8rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
