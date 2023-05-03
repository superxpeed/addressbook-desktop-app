const babelConfig = require("./babel.config");

module.exports = [{
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
}, {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: {amd: false},
    use: {
        loader: '@vercel/webpack-asset-relocator-loader',
        options: {
            outputAssetBase: 'native_modules',
        },
    },
}, {
    test: /\.(js|ts)x?$/,
    use: {
        loader: 'babel-loader',
        options: babelConfig
    }
},];
