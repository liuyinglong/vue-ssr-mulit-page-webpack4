const path = require('path')
const webpack = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const {VueLoaderPlugin} = require('vue-loader')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    devtool: isProd ? false : '#cheap-module-source-map',
    mode: isProd ? 'production' : 'development',

    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath: "/dist/",
    },

    resolve: {
        alias: {
            'public': path.resolve(__dirname, '../public'),
            "@": path.resolve(__dirname, "../src")
        }
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: {
                        preserveWhitespace: false
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [[
                        '@babel/preset-env', {
                            "useBuiltIns": "usage",
                            "corejs": 3
                        }
                    ]]
                }
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'images/[name].[ext]?[hash]'
                }
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|otf)(\?\S*)?$/,
                loader: 'file-loader',
                query: {
                    name: 'font/[name].[ext]?[hash]'
                }
            }
        ]
    },


    //这些选项可以控制 webpack 如何通知「资源(asset)和入口起点超过指定文件限制」
    performance: {
        maxEntrypointSize: 1024 * 800,            //入口最大体积
        maxAssetSize: 1024 * 700,                 //生成的单个资源提及
        hints: isProd ? 'warning' : false   //在开发环境关闭提示
    },

    plugins: isProd
        ? [
            new VueLoaderPlugin(),

            //过去 webpack 打包时的一个取舍是将 bundle 中各个模块单独打包成闭包。这些打包函数使你的 JavaScript 在浏览器中处理的更慢。相比之下，一些工具像 Closure Compiler 和 RollupJS 可以提升(hoist)或者预编译所有模块到一个闭包中，提升你的代码在浏览器中的执行速度。
            new webpack.optimize.ModuleConcatenationPlugin(),

        ]
        : [
            new VueLoaderPlugin(),
            new FriendlyErrorsPlugin()
        ]
}

//开发环境loader配置
let developmentLoader = [
    {
        test: /\.scss$/,
        use: [
            {
                loader: "vue-style-loader",
                options: {
                    sourceMap: true
                }
            },
            {
                loader: "css-loader",
                options: {
                    sourceMap: true,
                    importLoaders: 1,
                    modules: "global",
                }
            },
            {
                loader: "sass-loader",
                options: {
                    sourceMap: true
                }
            }
        ]
    }
]

//生产环境loader配置
let productionLoader = [
    {
        test: /\.scss$/,
        use: [
            {
                loader: "vue-style-loader"
            },
            {
                loader: "css-loader",
                options: {
                    importLoaders: 2,
                    modules: "global"
                }
            },
            {
                loader: "postcss-loader",
                options: {
                    plugins: [
                        require('precss')({/* ...options */}),
                        require('autoprefixer')({/* ...options */})
                    ]
                }
            },
            {
                loader: "sass-loader"
            }
        ]
    }
]

if (isProd) {
    module.exports.module.rules = module.exports.module.rules.concat(productionLoader)
} else {
    module.exports.module.rules = module.exports.module.rules.concat(developmentLoader)
}