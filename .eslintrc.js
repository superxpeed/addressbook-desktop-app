module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    parser: "@babel/eslint-parser",
    overrides: [],
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {
            "jsx": true
        },
        "project": "./tsconfig.json"
    },
    plugins: [
        "react",
    ],
    rules: {
        "no-debugger": 0,
        "no-console": 0,
        "new-cap": 0,
        "strict": 0,
        "no-underscore-dangle": 0,
        "no-use-before-define": 0,
        "eol-last": 0,
        "no-prototype-builtins": 0,
        "quotes": [1, "double"],
        "jsx-quotes": [1, "prefer-double"],
        "react/jsx-no-undef": 1,
        "no-case-declarations": 0,
        "react/jsx-uses-react": 1,
        "react/jsx-uses-vars": 1,
        "react/prop-types": 0,
        "no-unused-vars": [1, {"argsIgnorePattern": "(snapshot)|(prevState)|(getState)|(e)|(json)|(props)|(dispatch)|(i)|(array)|(colIdx)|(rowIdx)|(row)"}],
        "no-undef": 2,
        "react/no-find-dom-node": 0
    },
    globals: {
        "$": true,
        "getContextPath": true,
        "setState": true,
        "moment": true
    }
};
