module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: { node: true, es2022: true },
  ignorePatterns: [
    '**/dist/**',
    '**/lib/**',
    '**/node_modules/**',
    '**/.husky/**',
    '**/*.config.*',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    // 1. shared 包禁止导入平台包
    {
      files: ['packages/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { group: ['react-native', 'react-native/*'], message: 'shared 包禁止导入 RN' },
              { group: ['@tarojs/*'], message: 'shared 包禁止导入 Taro' },
              { group: ['@nestjs/*'], message: 'shared 包禁止导入 NestJS' },
            ],
          },
        ],
      },
    },
    // 2. 小程序端启用 React 规则
    {
      files: ['apps/miniapp/**/*.{ts,tsx}'],
      plugins: ['react', 'react-hooks'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      settings: { react: { version: 'detect' } },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    // 3. 后端放宽 any 和 console
    {
      files: ['apps/server/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-console': 'off',
      },
    },
  ],
}
