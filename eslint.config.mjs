import { FlatCompat } from "@eslint/eslintrc";
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import PluginImport from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Глобальные игнорирования (применяются ко всем конфигурациям)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**', 
      'out/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
    ]
  },
  {
        files: ['src/**/*.{js,ts}'],

        plugins: {
            '@typescript-eslint': typescriptEslint,
            'simple-import-sort': simpleImportSort,
            'sort-keys-fix': sortKeysFix,
            import: PluginImport,
            jsdoc: jsdoc,
            prettier: eslintPluginPrettier,
        },
        
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                project: './tsconfig.json',
            },
        },

        rules: {
            // ===============================
            // TypeScript
            // ===============================
            'no-unused-vars': 'off', // отключаем базовое правило в пользу @typescript-eslint
            '@typescript-eslint/ban-ts-comment': 'error',
            '@typescript-eslint/default-param-last': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/explicit-function-return-type': ['warn', { allowTypedFunctionExpressions: true }],
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/no-floating-promises': ['warn', { ignoreVoid: true }],
            '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
            '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            // ===============================
            // Импорты
            // ===============================
            'import/no-extraneous-dependencies': [
                'error',
                {
                  devDependencies: [
                    // тесты
                    '**/*.test.{ts,js}',
                    '**/*.spec.{ts,js}',
                    'test/**/*.{ts,js}',
                    '**/__tests__/**/*.{ts,js}',
                    // скрипты
                    'scripts/**/*.{ts,js}',
                    // конфиги
                    '**/*.config.{mjs,js,cjs,ts}',
                  ],
                  optionalDependencies: false,
                  peerDependencies: false,
                },
              ],
            'import/no-unresolved': 'off',
            'import/prefer-default-export': 'off',
            'import/no-cycle': ['warn', { maxDepth: 1 }],
            'simple-import-sort/imports': 'error',

            // ===============================
            // Общие правила код-стайла
            // ===============================
            'array-callback-return': 'error',
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'dot-notation': 'error',
            'eol-last': ['error', 'always'],
            eqeqeq: 'error',
            indent: 'off',
            'max-depth': ['error', 5],
            'operator-linebreak': ['error', 'after'],
            'padding-line-between-statements': [
                'error',
                {
                    blankLine: 'always',
                    prev: '*',
                    next: ['const', 'let', 'var', 'block-like', 'class', 'import'],
                },
                {
                    blankLine: 'always',
                    prev: ['const', 'let', 'var', 'block-like', 'class', 'import'],
                    next: '*',
                },
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                { blankLine: 'any', prev: ['import'], next: ['import'] },
                { blankLine: 'never', prev: 'case', next: ['case'] },
                { blankLine: 'always', prev: 'block-like', next: ['case'] },
                { blankLine: 'never', prev: 'break', next: ['case'] },
            ],
            'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
            'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
            'object-curly-newline': ['error', { multiline: true, consistent: true }],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-newline': ['error', 'consistent'],
            'array-element-newline': ['error', 'consistent'],

            // ===============================
            // JSDoc
            // ===============================
            'jsdoc/require-jsdoc': [
                'warn',
                {
                    publicOnly: true,
                    enableFixer: false,
                    require: {
                        "FunctionDeclaration": true,
                        "MethodDefinition": true,
                        "ClassDeclaration": true,
                        "ArrowFunctionExpression": true,
                        "FunctionExpression": true
                    },
                },
            ],
            'jsdoc/require-description': ['warn'],

            // ===============================
            // Prettier
            // ===============================
            'prettier/prettier': 'error',
            ...prettierConfig.rules,
        },
    },
];

export default eslintConfig;
