module.exports = {
  extends: ["turbo", "prettier", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/ban-ts-comment": 1,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
