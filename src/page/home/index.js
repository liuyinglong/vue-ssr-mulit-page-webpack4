import Vue from 'vue'
import App from './App.vue'
import {createRouter} from "./router/router"

export function createApp({routerBasePath}) {
    let router=createRouter({
        routerBasePath
    })

    const app = new Vue({
        render: function (createElement) {
            return createElement(App)
        },
        router
    })
    return {app, router}
}