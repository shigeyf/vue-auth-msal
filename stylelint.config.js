//
// stylelint.config.js
//

// Setup:
// [run]
// npm install --save-dev stylelint stylelint-config-standard-scss
// npm pkg set scripts.stylelint:check="stylelint **/*.{sass,scss,css}"
// npm pkg set scripts.stylelint:fix="stylelint --fix **/*.{sass,scss,css}"
// [/run]

/** @type {import("stylelint").Config} */
const config = {
  extends: 'stylelint-config-standard-scss',
  rules: {
    'order/properties-alphabetical-order': true,
  },
}
module.exports = config
