//
// lint-staged.config.js
//

// Setup:
// [run]
// npm pkg set scripts.format:lint-staged="prettier --write"
// npm pkg set scripts.lint:lint-staged="eslint --fix"
// npm pkg set scripts.stylelint:lint-staged="stylelint --fix"
// [/run]

/** @type {import("lint-staged").configObject} */
const config = {
  '**/*.{json,yaml,yml,html,md,sass,scss,css,js,jsx,ts,tsx,vue}': (filenames) =>
    filenames.map((filename) => `npm run format:lint-staged '${filename}'`),
  '**/*.{js,jsx,ts,tsx,vue}': (filenames) => filenames.map((filename) => `npm run lint:lint-staged '${filename}'`),
  '**/*.{sass,scss,css}': (filenames) => filenames.map((filename) => `npm run stylelint:lint-staged '${filename}'`),
}
module.exports = config
