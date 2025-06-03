import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import jslint from '@eslint/js';
import globals from 'globals';
import tslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import vuePlugin from 'eslint-plugin-vue';

export default defineConfig([
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    languageOptions: { globals: globals.browser },
  },
  jslint.configs.recommended,
  tslint.configs.recommended,
  prettierRecommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tslint.parser } },
  },
]);
