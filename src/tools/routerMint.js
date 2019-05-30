import VueRouter from "vue-router"
import Vue from "vue"

Vue.use(VueRouter)

export default function ({routes, mode = 'history', routerBasePath = "", base = ""}) {

    if (process.env.VUE_ENV === "client") {
        base = routerBasePath
    } else {
        routes.forEach((routeConfig) => {
            routeConfig.path = `${routerBasePath}${routeConfig.path}`
        })
    }

    return new VueRouter({
        mode,
        routes,
        base
    })
}