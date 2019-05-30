import {
    promisify,
    applyAsyncData,
    sanitizeComponent,
    getMatched
} from "../../../util/util.js"

import {createApp} from "../index.js"

let {asyncData, routerBasePath} = window.__INITIAL_STATE__ || {}

let {app, router} = createApp({
    routerBasePath: routerBasePath
})

//应用服务端渲染的数据到data
router.onReady(() => {
    const Components = router.getMatchedComponents()
    Components.map((Component, index) => {
        applyAsyncData(sanitizeComponent(Component), asyncData[index] || {})
    })
    app.$mount('#app')
})


router.beforeResolve((to, from, next) => {

    const matchedInfo = getMatched(to)
    let activated = []
    matchedInfo.map(function ({components, instances}) {
        components.forEach((component,index) => {
            if(!instances[index]){
                activated.push(component)
            }
        })
    })

    const asyncDataHooks = activated.map(c => c.asyncData)
    if (!asyncDataHooks.length) {
        return next()
    }

    Promise.all(asyncDataHooks.map((asyncDataFun, index) => {
        return promisify(asyncDataFun, {route: to})
            .then(function (asyncDataResult) {
                applyAsyncData(sanitizeComponent(activated[index]), asyncDataResult)
                return asyncDataResult
            })
    })).then(() => {
        next()
    }).catch((err) => {
        console.log(err)
    })
})