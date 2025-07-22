import { dirname } from "path";
import { fileURLToPath } from "url";
// eslint-disable-next-line import/no-extraneous-dependencies
import { FlatCompat } from "@eslint/eslintrc";
// eslint-disable-next-line import/no-extraneous-dependencies
import unusedImports from "eslint-plugin-unused-imports";
// eslint-disable-next-line import/no-extraneous-dependencies
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/typescript", "plugin:prettier/recommended"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": "error",
      "unused-imports/no-unused-vars": "off",
      "import/no-extraneous-dependencies": ["error", { devDependencies: false }],
    },
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
    },
  },
];

export default eslintConfig;
