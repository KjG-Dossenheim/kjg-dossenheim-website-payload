import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import globals from "globals";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
})

const eslintConfig = [{
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}, ...compat.config({
  extends: ['eslint:recommended', 'prettier', 'next/core-web-vitals', 'next/typescript'],
  globals: {
    ...globals.node,
  },
})]

export default eslintConfig