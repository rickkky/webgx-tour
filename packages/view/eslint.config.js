import { defineConfig } from 'eslint/config';
import rootConfig from '../../eslint.config.js';
import { flatConfig } from '@next/eslint-plugin-next';

export default defineConfig([
  rootConfig,
  flatConfig.recommended,
  {
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
