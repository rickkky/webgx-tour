import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import jslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tslint from 'typescript-eslint';

export default defineConfig([
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    languageOptions: { globals: globals.browser },
  },
  jslint.configs.recommended,
  tslint.configs.recommended,
  prettierRecommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tslint.parser } },
  },
]);
