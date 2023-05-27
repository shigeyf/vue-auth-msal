//
// commitlint.config.js
//

/** @type {import("@commitlint/cli").CliFlags} */
const config = {
  extends: ['@commitlint/config-conventional'],
  // https://commitlint.js.org/#/reference-rules
  rules: {
    'subject-case': [
      2,
      'always',
      [
        'lower-case', // default
        'upper-case', // UPPERCASE
        'camel-case', // camelCase
        'kebab-case', // kebab-case
        'pascal-case', // PascalCase
        'sentence-case', // Sentence case
        'snake-case', // snake_case
        'start-case', // Start Case
      ],
    ],
    'type-enum': [2, 'always', ['chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'release', 'style', 'test']],
  },
}
module.exports = config
