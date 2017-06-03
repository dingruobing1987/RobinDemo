var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CompleteTimeWebpackPlugin = require('complete-time-webpack-plugin');
var Constants = require('./webpack.config.constant.js');

// 获取环境变量
var env = process.env.NODE_ENV;
console.log('Webpack run in ' + env);
// 后端开发调试
var isBackend = (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'backend');
// 打包部署
var isProduction = (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production')

console.log('isProduction= ' + isProduction);

// 打包编译到目标路径
var buildpath = './dist/';
if (isBackend) {
    buildpath = Constants.BACKEND_DEBUG_PATH;
} else if (isProduction) {
    buildpath = Constants.DEPLOY_PATH;
}
// 删除打包目录的文件，防止带hash值的文件积累
var deleteTargetFolder = function (path) {
    var files = [];
    try {
        fs.access(path, function (err) {
            if (err == null) {
                files = fs.readdirSync(path);
                files.forEach(function (file, index) {
                    var currentPath = path + '/' + file;
                    if (fs.statSync(currentPath).isDirectory()) { // recurse
                        deleteTargetFolder(currentPath);
                        // 目录不会带hash值，暂不删除，仅删除文件
                        // fs.rmdirSync(currentPath);
                    } else { // delete file
                        fs.unlinkSync(currentPath);
                    }
                });
            }
        })
    } catch (e) {
        console.log("delete target folder err~")
    }
}

deleteTargetFolder(buildpath);

// 文件分块
var entrySet = {
    'bundle': ['./src/Index.tsx'],
    'main-style': ['./src/styles/main.less'],
    'language': ['./src/language/en_US.ts', './src/language/zh_CN.ts']
};

// 输出文件名
var output = {
    path: buildpath,
    filename: '[name].js'
};

var copyFiles = [
    // IE兼容
    { from: './node_modules/match-media/matchMedia.js', to: './3rdlib/match-media/matchMedia.js' },
    { from: './node_modules/match-media/matchMedia.addListener.js', to: './3rdlib/match-media/matchMedia.addListener.js' },
    { from: './node_modules/console-polyfill/index.js', to: './3rdlib/console-polyfill/index.js' },
    { from: './node_modules/es5-shim/es5-shim.min.js', to: './3rdlib/es5-shim/es5-shim.min.js' },
    { from: './node_modules/es6-shim/es6-sham.min.js', to: './3rdlib/es6-shim/es6-sham.min.js' },
    { from: './node_modules/es6-shim/es6-shim.min.js', to: './3rdlib/es6-shim/es6-shim.min.js' },
    // 第三方
    { from: './node_modules/intl/dist/Intl.min.js', to: './3rdlib/intl/Intl.min.js' },
    { from: './node_modules/react/dist/react.min.js', to: './3rdlib/react/react.min.js' },
    { from: './node_modules/react-dom/dist/react-dom.min.js', to: './3rdlib/react-dom/react-dom.min.js' },
    { from: './node_modules/jquery/dist/jquery.min.js', to: './3rdlib/jquery/jquery.min.js' },
    { from: './node_modules/antd/dist/antd.min.js', to: './3rdlib/antd/antd.min.js' },
    { from: './node_modules/antd/dist/antd.min.css', to: './3rdlib/antd/antd.min.css' },
    // 算法文件
    { from: './algorithm/lml.js', to: './algorithm/lml.js' },
    { from: './algorithm/model.js', to: './algorithm/model.js' },
    { from: './algorithm/pde.js', to: './algorithm/pde.js' },
    { from: './algorithm/sys.js', to: './algorithm/sys.js' }
];

if (isBackend || isProduction) {
    copyFiles.push({ from: './src/resources', to: './resource' });
}

if (isBackend) {
    // 首页
    copyFiles.push({ from: './indexreact.html', to: './indexreact.html' });
}

if (isProduction) {
    // 首页
    copyFiles.push({ from: './indexreacttemplate.html', to: './indexreact.html' });
}

// 插件
var plugins = [
    // 出现次数排序优化
    new webpack.optimize.OccurrenceOrderPlugin(),
    // 传入NODE_ENV
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env)
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    // 拷贝第三方文件和html
    new CopyWebpackPlugin(copyFiles),

    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"language", output.filename),

    //显示打包完成时间
    new CompleteTimeWebpackPlugin()
];


// if (isProduction || isBackend) {
//     plugins.push(new HtmlWebpackPlugin({
//         title: 'Unistar SCT',
//         template: './indexreacttemplate.html',
//         filename: './indexreact.html',
//         basePath: Constants.RESROUCE_BASE_URL
//     }));
// }

var sourceMap = "source-map";
if (isProduction) {

    //关闭source-map
    sourceMap = "hidden-source-map";

    // JS压缩
    var uglifyOptions = {
        compress: { sequences: false, warnings: false, join_vars: false, dead_code: false, unused: false },
        mangle: false
    };
    plugins.push(new webpack.optimize.UglifyJsPlugin(uglifyOptions));
}

module.exports =
    {
        entry: entrySet,

        output: output,

        module: {
            loaders: [
                // css加载
                {
                    test: /\.css$/,
                    loader: 'style-loader!css-loader'
                },
                // 图片，小于10k的内联成base64编码
                {
                    test: /\.(png|jpg|gif|PNG)$/,
                    loader: 'url?limit=10240&name=./img/[hash].[ext]'
                },
                // 图标字体glyphicon
                {
                    test: /\.(otf|eot|svg|ttf|woff)/,
                    loader: 'url'
                },
                // less文件
                {
                    test: /\.less$/,
                    loader: 'style!css!less'
                },
                // typescript编译器
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader'
                },
                // json，用于karma单元测试
                {
                    test: /\.json$/,
                    loader: 'json-loader'
                }

            ]
        },

        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ['', '.webpack.js', '.web.js', '.tsx', '.ts', '.js', '.less', '.css', '.ttf'],
            // typescript 相对路径
            root: [
                path.resolve('./src')
            ]
        },

        // 外部引用，React、JQuery
        externals: {
            // react
            'react': 'React',
            // react DOM
            'react-dom': 'ReactDOM',
            // jquery
            'jquery': '$',
            // antd
            'antd': 'antd'
        },

        // 定义source-map的级别
        devtool: sourceMap,

        plugins: plugins,
    }
