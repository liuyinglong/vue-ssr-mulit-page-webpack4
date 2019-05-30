let express = require("express")
let app = express()
let path = require("path")
let fs = require("fs")

const {createBundleRenderer} = require('vue-server-renderer')

//由于VUE的限制，当前（2019/05/22）不能使用最新版本
const LRU = require('lru-cache')

//模板文件
const baseTemplatePath = path.resolve(__dirname, '../src/template/index.template.html')

//入口文件配置
const entryFile = require("../build/entryFile/getEntryFile")

//webpack配置
let {serverConfigMap, clientConfigMap} = require("../build/multiPageWebPackConfig")

//webpack 开发环境配置
let setUpDevServer = require("../build/setup-dev-server")

let promiseMap = {}
let rendererMap = {}

//环境判断
const NODE_ENV = process.env.NODE_ENV

function createRenderer(bundle, options) {
    // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
    return createBundleRenderer(bundle, Object.assign(options, {
        // for component caching
        cache: LRU({
            max: 1000,
            maxAge: 1000 * 60 * 15
        }),
        // this is only needed when vue-server-renderer is npm-linked
        basedir: path.resolve(__dirname, '../dist'),

        // recommended for performance
        runInNewContext: false,
    }))
}

function render({req, res, pageName, routerBasePath}) {
    res.setHeader("Content-Type", "text/html")
    const handleError = err => {
        if (err.url) {
            res.redirect(err.url)
        } else if (err.code === 404) {
            res.status(404).send('404 | Page Not Found')
        } else {
            // Render Error Page or Redirect
            res.status(500).send('500 | Internal Server Error')
            console.error(`error during render : ${req.url}`)
            console.error(err)
        }
    }

    const context = {
        title: '标题', // default title
        url: req.url,
        routerBasePath
    }

    rendererMap[pageName].renderToString(context, (err, html) => {
        if (err) {
            console.log(err)
            return handleError(err)
        }
        res.send(html)
    })
}

//根据不同的环境来生成renderer,开发环境根据setup-dev-server来生成
if (NODE_ENV === "development") {
    Object.keys(entryFile.page).forEach((pageName) => {

        promiseMap[pageName] = setUpDevServer({
            app: app,
            templatePath: baseTemplatePath,
            serverConfig: serverConfigMap[pageName],
            clientConfig: clientConfigMap[pageName],
            pageName: pageName,
            cb: function (bundle, options, pageName) {
                rendererMap[pageName] = createRenderer(bundle, options)
            }
        })

        let pageBuildConfig = entryFile.page[pageName]

        app.get(`${pageBuildConfig.routerBasePath}/*`, function (req, res) {
            promiseMap[pageName].then(() => {
                render({
                    req,
                    res,
                    pageName,
                    routerBasePath: pageBuildConfig.routerBasePath,
                })
            })
        })

    })
}

//生产环境，读取buildConfig.json文件来自动生成路由
if (NODE_ENV === "production") {
    let buildConfig = require("../dist/buildConfig.json")
    Object.keys(buildConfig).forEach((pageName) => {

        let pageBuildConfig = buildConfig[pageName]

        let bundlePath = path.join(__dirname, "../dist/", pageBuildConfig.serverBundle)
        let templatePath = path.join(__dirname, "../dist/", pageBuildConfig.templatePath)
        let bundle = require(bundlePath)
        rendererMap[pageName] = createRenderer(bundle, {
            template: fs.readFileSync(templatePath, "utf-8")
        })

        //页面访问路由
        app.get(`${pageBuildConfig.routerBasePath}/*`, function (req, res) {
            render({
                req,
                res,
                pageName,
                routerBasePath: pageBuildConfig.routerBasePath
            })
        })

    })

    //静态文件
    let maxAge = 3600 * 1000 * 24 * 30  //静态文件缓存30天
    app.use("/public", express.static(path.join(__dirname, "../dist/public"), {
        maxAge: maxAge,
        setHeaders: function (res, path, stat) {
            //字体文件运行跨域
            if (/\.(ttf|woff|woff2|otf)$/.test(path)) {
                res.set("Access-Control-Allow-Origin", "*")
            }
        }
    }))
}

const port = process.env.PORT || 8081
app.listen(port, () => {
    console.log(`server started at localhost:${port}`)
})
