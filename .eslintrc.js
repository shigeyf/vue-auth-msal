//
// .eslintrc.js
//

// Setup:
// [run]
// npm install --save-dev eslint
// npm install --save-dev eslint-plugin-vue @vue/eslint-config-typescript
// npm install --save-dev eslint-config-prettier
// npm pkg set scripts.lint:check="eslint --ext .ts,.tsx,.js,.jsx,.vue ."
// npm pkg set scripts.lint:fix="eslint --max-warnings 0 --ext .ts,.tsx,.js,.jsx,.vue --fix ."
// [/run]

const config = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript/recommended',
    // Simply add only 'prettier' in eslint-config-prettier 8.0.0 or later
    'prettier',
    // eslint-plugin-prettier is not used according to general recommendation
    // so the 'plugin:prettier/recommended' extension should not be in here.
  ],
  plugins: ['vue', '@typescript-eslint'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  globals: {},
  overrides: [],
  rules: {
    // Keep recommended tag order in SFC
    'vue/component-tags-order': [
      'error',
      {
        order: ['script', 'template', 'style'],
      },
    ],
    // Recommended rules when usaging with Prettier
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
  },
}
module.exports = config
