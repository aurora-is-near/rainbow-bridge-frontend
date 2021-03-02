module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'standard-with-typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    project: './packages/**/tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: '.'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
  }
}
