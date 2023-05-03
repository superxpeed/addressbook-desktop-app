module.exports = {
    presets: [
        "@babel/preset-react",
        "@babel/preset-typescript",
        ["@babel/env", {
            targets: {
                ie: "11",
            },
        }],
    ],
    plugins: [
        "@babel/plugin-proposal-class-properties",
    ],
};
