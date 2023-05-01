const rules = require('./webpack.rules');
const TerserPlugin = require('terser-webpack-plugin');

rules.push({
    test: /\.css$/,
    use: [{loader: 'style-loader'}, {loader: 'css-loader'}],
});

module.exports = {
    module: {
        rules,
    },
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
