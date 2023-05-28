// @ts-check

/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */

module.exports = {
  $schema: "http://json.schemastore.org/prettierrc",
  arrowParens: "avoid",
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  printWidth: 100,
  proseWrap: "always",
  quoteProps: "as-needed",
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
  bracketSpacing: true,
  importOrder: ["<BUILTIN_MODULES>", "<THIRD_PARTY_MODULES>", "", "^[.]"],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
};
