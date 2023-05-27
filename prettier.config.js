//
// prettier.config.js
//

// Setup:
// [run]
// npm install --save-dev prettier
// npm pkg set scripts.format:check="prettier --check ."
// npm pkg set scripts.format:fix="prettier --write ."
// [/run]

/** @type {import("prettier").Options} */
const config = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  bracketSpacing: true,
  printWidth: 120,
  vueIndentScriptAndStyle: true,
}
module.exports = config
