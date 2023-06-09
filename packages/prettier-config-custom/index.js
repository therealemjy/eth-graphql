module.exports = {
  $schema: "http://json.schemastore.org/prettierrc",
  arrowParens: "avoid",
  bracketSpacing: false,
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
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrder: ["<THIRD_PARTY_MODULES>", "^@src/(.*)$", "^@bin/(.*)$", "^[./]"],
};
