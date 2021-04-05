const HtmlWebpackPlugin = require('html-webpack-plugin'); // Require  html-webpack-plugin plugin
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const path = require('path');

module.exports = {
    entry: __dirname + "/src/scripts/main.ts", // webpack entry point. Module to start building dependency graph
    output: {
        path: '/public', // Folder to store generated bundle
        filename: 'bundle.js',  // Name of generated bundle after build
        publicPath: '/' // public URL of the output directory when referenced in a browser
    },
    mode: 'development',
    devtool: 'inline-source-map',
    stats: {
        children: true
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".js"],
        plugins: [
            new TsconfigPathsPlugin()
        ],
        modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
    },
    module: {  // where we defined file patterns and their loaders
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: [
                    /node_modules/
                ]
            },
            {
                test: /\.html/,
                loader: 'raw-loader'
            },
            {
                test: /\.tsx?$/, loader: "ts-loader",
                enforce: "pre",
            },
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.(png|jpe?g|jpg|gif|fbx|glb)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.worker\.js$/,
                use: { loader: "worker-loader" },
            },
        ]
    },
    plugins: [  // Array of plugins to apply to build chunk
        new HtmlWebpackPlugin({
            template: __dirname + "/src/index.html",
            inject: 'body'
        })
    ],
    devServer: {  // configuration for webpack-dev-server
        port: 7700, // port to run dev-server
    }
};