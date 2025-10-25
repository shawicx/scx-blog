export default {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off', // Let TypeScript handle this
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        extraFileExtensions: ['.astro'],
      },
      rules: {},
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '.git/'],
};