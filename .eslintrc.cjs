module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended'],
  env: {
    node: true,
    es2020: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
