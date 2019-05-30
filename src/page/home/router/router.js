/**
 * create by focus on 2019/5/22 13:59
 * 路由表文件
 * 保存当前文件的路由
 */

import RouterMint from "@/tools/routerMint"
import Index from "../view/index/Index.vue"
import Detail from "../view/detail/Detail.vue"
import DetailA from "../view/detail/component/A.vue"
import DetailB from "../view/detail/component/B.vue"

function routes() {
    return [
        {
            path: "",
            name: "index",
            component: Index
        },
        {
            path: "",
            name: "index",
            component: Index
        },
        {
            path: "/detail",
            name: "Detail",
            component: Detail,
            children: [
                {
                    path: "a",
                    component: DetailA
                },
                {
                    path: "b",
                    component: DetailB
                }
            ]
        }
    ]
}

export function createRouter({routerBasePath}) {
    return RouterMint({
        routes: routes(),
        routerBasePath: routerBasePath
    })
}

