import stylistic from "@stylistic/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import importAccess from "eslint-plugin-import-access/flat-config";
import solid from "eslint-plugin-solid/configs/typescript";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      ".output",
      ".vinxi",
      "node_modules",
    ],
  },
  {
    name: "ts environment",
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        // ...vitest.environments.env.globals,
      },
    },
  },
  tseslint.configs.recommended,
  {
    name: "ts file",
    files: ["**/*.{ts,tsx}"],
    plugins: {
      tseslint: tseslint.plugin,
      "@stylistic": stylistic,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        args: "none",
        varsIgnorePattern: "^_",
        caughtErrors: "none",
      }],
      "@typescript-eslint/no-explicit-any": ["error", {
        ignoreRestArgs: true,
      }],
      "@stylistic/eol-last": ["warn", "always"],
      "@stylistic/indent": ["warn", 2, {
        ignoredNodes: [
          "TSTypeParameterInstantiation",
          "TSUnionType",
          "TSIntersectionType",
        ],
        SwitchCase: 1,
      }],
      "@stylistic/no-multiple-empty-lines": ["warn", {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      }],
      "@stylistic/arrow-parens": ["warn", "always"],
      "@stylistic/arrow-spacing": "warn",
      "@stylistic/comma-dangle": ["warn", "always-multiline"],
      "@stylistic/keyword-spacing": "warn",
      "@stylistic/key-spacing": "warn",
      "@stylistic/member-delimiter-style": ["warn"],
      "@stylistic/newline-per-chained-call": "warn",
      "@stylistic/no-multi-spaces": "warn",
      "@stylistic/no-trailing-spaces": "warn",
      "@stylistic/object-curly-spacing": ["warn", "always"],
      "@stylistic/object-property-newline": ["warn", {
        allowAllPropertiesOnSameLine: true,
      }],
      "@stylistic/operator-linebreak": ["warn", "before"],
      "@stylistic/quotes": ["warn", "double"],
      "@stylistic/quote-props": ["warn", "as-needed"],
      "@stylistic/semi": "warn",
      "@stylistic/space-before-blocks": "warn",
      "@stylistic/space-before-function-paren": ["warn", {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      }],
      "@stylistic/space-infix-ops": "warn",
      "@stylistic/space-in-parens": "warn",
      "@stylistic/space-unary-ops": "warn",
      "@stylistic/type-annotation-spacing": "warn",
    },
  },
  importPlugin.flatConfigs.recommended,
  {
    name: "import order",
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "import-access": importAccess as any,
    },
    rules: {
      "import/named": "off",
      "import/no-unresolved": "off",
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/order": ["warn", {
        groups: [["builtin", "external", "type"], ["internal", "parent", "sibling"], "index", "object"],
        pathGroups: [{
          pattern: "~/**",
          group: "internal",
          position: "before",
        }, {
          pattern: "./**.module.css",
          group: "index",
          position: "before",
        }],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        distinctGroup: false,
      }],
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "none",
          argsIgnorePattern: "^_+$",
          varsIgnorePattern: "^_+$",
          caughtErrorsIgnorePattern: "^_+$",
          destructuredArrayIgnorePattern: "^_+$",
        },
      ],
      "import-access/jsdoc": ["error"],
    },
  },
  {
    name: "jsx",
    files: ["**/*.tsx"],
    plugins: {
      "@stylistic": stylistic,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      solid: solid.plugins.solid as any,
    },
    rules: {
      ...solid.rules,
      "@stylistic/jsx-closing-bracket-location": "warn",
      "@stylistic/jsx-closing-tag-location": "off",
      "@stylistic/jsx-curly-brace-presence": ["warn", {
        children: "ignore",
        propElementValues: "always",
      }],
      "@stylistic/jsx-curly-spacing": "warn",
      "@stylistic/jsx-max-props-per-line": ["warn", { when: "multiline" }],
      "@stylistic/jsx-one-expression-per-line": ["warn", { allow: "non-jsx" }],
      "@stylistic/jsx-self-closing-comp": "warn",
      "@stylistic/jsx-tag-spacing": ["warn", {
        closingSlash: "never",
        beforeSelfClosing: "always",
        afterOpening: "never",
        beforeClosing: "never",
      }],
      "@stylistic/jsx-wrap-multilines": ["warn", {
        declaration: "parens-new-line",
        assignment: "parens-new-line",
        return: "parens-new-line",
        arrow: "parens-new-line",
        condition: "parens-new-line",
        logical: "parens-new-line",
        prop: "parens-new-line",
        propertyValue: "parens-new-line",
      }],
    },
  },
]);
