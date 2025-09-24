import { flatConfig } from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';

import rootConfig from '../../eslint.config.js';

export default defineConfig([
  rootConfig,
  flatConfig.recommended,
  {
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
