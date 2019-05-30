import Vue from "vue"

export function promisify(fn, context) {
    if (!fn) {
        return Promise.resolve({})
    }
    let promise = fn(context)
    if (!promise || (!(promise instanceof Promise) && (typeof promise.then !== 'function'))) {
        promise = Promise.resolve(promise)
    }
    return promise
}

//extend后的组件 data的配置
export function applyAsyncData(Component, asyncData) {
    const ComponentData = Component.options.data || function () {
        return {}
    }

    Component.options.data = function () {
        const data = ComponentData.call(this)
        return {...data, ...asyncData}
    }
}

export function getMatchedComponents(route) {
    return Array.prototype.concat.apply([], route.matched.map((m, index) => {
        return Object.keys(m.components).map((key) => {
            return m.components[key]
        })
    }))
}

//获取路由匹配到的组件实例
export function getMatchedComponentsInstances(route) {
    return Array.prototype.concat.apply([], route.matched.map((m, index) => {
        return Object.keys(m.instances).map((key) => {
            return m.instances[key]
        })
    }))
}

//获取路由匹配到的组件和组件Instance
export function getMatched(route) {
    return Array.prototype.concat.apply([], route.matched.map((m, index) => {
        let components = Object.keys(m.components).map((key) => {
            return m.components[key]
        })
        let instances = Object.keys(m.instances).map((key) => {
            return m.instances[key]
        })
        return {components, instances}
    }))
}

//构造组件，返回构造后的组件
export function sanitizeComponent(Component) {
    // If Component already sanitized
    if (Component.options && Component._Ctor === Component) {
        return Component
    }
    if (!Component.options) {
        Component = Vue.extend(Component) // fix issue #6
        Component._Ctor = Component
    } else {
        Component._Ctor = Component
        Component.extendOptions = Component.options
    }
    // For debugging purpose
    if (!Component.options.name && Component.options.__file) {
        Component.options.name = Component.options.__file
    }
    return Component
}