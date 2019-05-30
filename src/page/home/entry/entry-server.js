import {createApp} from '../index.js'
import {
    promisify,
    applyAsyncData,
    sanitizeComponent
} from "@/util/util.js"

export default (ssrContext) => {
    // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
    // 以便服务器能够等待所有的内容在渲染前，
    // 就已经准备就绪。
    return new Promise((resolve, reject) => {
        const {app, router} = createApp({
            routerBasePath: ssrContext.routerBasePath
        })

        ssrContext.asyncData = {}

        // 设置服务器端 router 的位置
        router.push(ssrContext.url)

        // 等到 router 将可能的异步组件和钩子函数解析完
        router.onReady(async () => {
            const Components = router.getMatchedComponents()

            // 匹配不到的路由，执行 reject 函数，并返回 404
            if (!Components.length) {
                return reject({code: 404})
            }

            // 合并asyncData中的值到data
            let asyncDataPromise = Components.map(async (Component) => {
                Component = sanitizeComponent(Component)
                if (Component.options.asyncData && typeof Component.options.asyncData === 'function') {
                    return promisify(Component.options.asyncData, {
                        ssrContext,
                        router,
                        route: router.currentRoute
                    }).then((asyncDataResult) => {
                        applyAsyncData(Component, asyncDataResult)
                        return asyncDataResult
                    })
                }
                return Promise.resolve({})
            })

            ssrContext.state = {
                routerBasePath: ssrContext.routerBasePath,
                asyncData: await Promise.all(asyncDataPromise)
            }
            resolve(app)
        }, reject)
    })
}