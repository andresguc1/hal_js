module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: ['html', 'prettier'],
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prettier/prettier': 'warn'
  }
};