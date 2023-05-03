const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    entry: "./src/main.js",
    module: {
        rules: require("./webpack.rules"),
    }, plugins: [
        new HtmlWebpackPlugin({
        filename: "splash.html",
        template: "src/splash.html",
        chunks: ["main"]
    })]
};
