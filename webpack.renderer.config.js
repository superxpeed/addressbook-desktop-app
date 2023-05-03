const rules = require("./webpack.rules");
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const path = require("path");

rules.push({
    test: /\.css$/,
    use: [{loader: "style-loader"}, {loader: "css-loader"}],
});

module.exports = {
    module: {
        rules,
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src"),
            "node_modules"
        ],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    },
    plugins: [new ESLintPlugin()],
    optimization: {
        minimizer: [(compiler) => {
            new TerserPlugin({
                terserOptions: {
                    compress: true,
                    sourceMap: true,
                    keep_fnames: true
                }
            }).apply(compiler);
        },],
    },
};
