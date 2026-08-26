import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'reference/**', 'public/**'] },
  {
    files: ['**/*.mjs', '*.config.js', 'scripts/**'],
    // browser-глобалы нужны в page.evaluate(): этот код выполняется в браузере,
    // хотя физически лежит в node-скрипте.
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
);
