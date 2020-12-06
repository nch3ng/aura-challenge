
module.exports = {
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
      "prettier",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/typescript",
      "plugin:prettier/recommended",
      "prettier/@typescript-eslint"

  ],
  "rules": {
      /**
       * @description rules of eslint official
       */
      /**
       * @bug https://github.com/benmosher/eslint-plugin-import/issues/1282
       * "import/named" temporary disable.
       */
      "import/named": "off",
      /**
       * @bug?
       * "import/export" temporary disable.
       */
      "import/export": "off",
      "import/prefer-default-export": "off", // Allow single Named-export
      "no-unused-expressions": ["warn", {
          "allowShortCircuit": true,
          "allowTernary": true
      }], // https://eslint.org/docs/rules/no-unused-expressions

      /**
       * @description rules of @typescript-eslint
       */
      "@typescript-eslint/prefer-interface": "off", // also want to use "type"
      "@typescript-eslint/explicit-function-return-type": "off", // annoying to force return type
      "no-plusplus": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      /**
       * Typescript overrides
       */
      "@typescript-eslint/no-var-requires": "off",
      /**
       * My overrides
       */
      "max-len": [
          "warn",
          {
              "code": 120,
              "ignoreUrls": true
          },
      ],
      "prefer-destructuring": [
          "warn",
          {
              "array": false,
              "object": true
          }
      ],
      "no-trailing-spaces": ["error", {"skipBlankLines": true}],
      "no-plusplus": ["error", {"allowForLoopAfterthoughts": true}],
      "no-bitwise": 'off',
      "no-restricted-syntax": 'off', // this is things like for...of etc.
  },
  "env": {
      "node": true,
      "mocha": true,
      "browser": true,
      "jest": true,
  }
};