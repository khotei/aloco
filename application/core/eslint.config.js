const js = require("@eslint/js")
const perfectionist = require("eslint-plugin-perfectionist")
const prettier = require("eslint-plugin-prettier/recommended")
const unusedImports = require("eslint-plugin-unused-imports")
const tseslint = require("typescript-eslint")

module.exports = tseslint.config(
  {
    ignores: ["eslint.config.js", "dist/", "src/__generated__/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ...perfectionist.configs["recommended-alphabetical"],
    rules: {
      ...perfectionist.configs["recommended-alphabetical"].rules,
      "perfectionist/sort-imports": [
        "error",
        {
          customGroups: {
            value: {
              builtin: "node:*",
            },
          },
          environment: "node",
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          ignoreCase: true,
          internalPattern: ["@/**"],
          newlinesBetween: "always",
          order: "asc",
          type: "alphabetical",
        },
      ],
    },
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    ...prettier,
    rules: {
      ...prettier.rules,
      "prettier/prettier": [
        "error",
        {
          arrowParens: "always",
          bracketSameLine: true ,
          bracketSpacing: true,
          endOfLine: "auto",
          htmlWhitespaceSensitivity: "css",
          insertPragma: false,
          jsxSingleQuote: true,
          printWidth: 80,
          proseWrap: "preserve",
          quoteProps: "as-needed",
          requirePragma: false,
          semi: false,
          singleAttributePerLine: true,
          singleQuote: false,
          tabWidth: 2,
          trailingComma: "es5",
        },
      ],
    },
  }
)
