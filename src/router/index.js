import Vue from 'vue'
import Router from 'vue-router'
import { routes } from './routers'
import store from '@/store'
import { getToken, setTitle, setToken, getISLOGIN } from '@/libs/util'
import config from '@/config'
const { homeName } = config

Vue.use(Router)
const router = new Router({
  routes,
   base: window.__POWERED_BY_QIANKUN__ ? `/${process.env.VUE_APP_CODE}` : `/web/${process.env.VUE_APP_CODE}/` ,
   mode: 'history',
})


router.beforeEach((to, from, next) => {
    to.meta.title && setTitle(to.meta.title)
    const token = getToken()
    const login_route = {
        name: 'login',
        params: {
            "c_url": window.location.href
        }
    }
    if (token) {
        if (!store.state.router.hasGetRules) {
            store.dispatch('authorization').then(rules => {
                store.dispatch('concatRoutes', rules).then(routers => {
                    router.addRoutes(routers)
                    next({...to, replace: true })
                }).catch((err) => {
                    setToken('')
                    next(login_route)
                })
            }).catch((err1) => {
                console.log(err1)
                setToken('')
                next(login_route)
            })
        } else {
            next()
        }
    } else {
        if (to.name === 'login') next()
        else next(login_route)
    }
})

router.afterEach(to => {
    window.scrollTo(0, 0)
})

export default router
