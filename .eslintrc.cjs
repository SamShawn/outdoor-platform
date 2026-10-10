module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: { node: true, es2022: true },
  ignorePatterns: ['dist', 'node_modules', '*.config.*'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
  overrides: [
    {
      // 关键规则：shared 禁止导入平台包
      files: ['packages/shared/**/*.ts'],
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
  ],
}
