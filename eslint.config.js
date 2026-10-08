import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['extension/vendor/', 'node_modules/', 'dist/'] },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['extension/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions } },
  },
  {
    files: ['scripts/**', 'tests/**', '*.js'],
    languageOptions: { globals: globals.node },
  },
];
