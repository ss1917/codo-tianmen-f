import {
    getBreadCrumbList,
    setTagNavListInLocalstorage,
    getMenuByRouter,
    getTagNavListFromLocalstorage,
    getHomeRoute,
    getNextRoute,
    routeHasExist,
    routeEqual,
    getRouteTitleHandled,
    localSave,
    localRead
} from '@/libs/util'
import { existBusinesslist, changeBusiness } from '@/api/app/business.js'
import { saveErrorLogger } from '@/api/data'
import router from '@/router'
import config from '@/config'
import { Store } from 'vuex'
const { homeName } = config

const closePage = (state, route) => {
    const nextRoute = getNextRoute(state.tagNavList, route)
    state.tagNavList = state.tagNavList.filter(item => {
        return !routeEqual(item, route)
    })
    router.push(nextRoute)
}

export default {
    state: {
        breadCrumbList: [],
        tagNavList: [],
        homeRoute: {},
        local: localRead('local'),
        errorList: [],
        hasReadErrorPage: false,
        //
        businessObj: {},
        theBusiness: '',
        resource_group: '',
        resourcesName: '',
        showBusiness: true,
        businessData: []
    },
    getters: {
        getterBusinessObj: state => state.businessObj,
        getterTheBusiness: state => state.theBusiness,
        resource_group: state => state.resource_group,
        getterResourcesName: state => state.resourcesName,
        getterBusinessData: state => state.businessData,
        errorCount: state => state.errorList.length
    },
    mutations: {
        setBusinessObj(state, objData) {
            state.businessObj = objData
        },
        setBusiness(state, business) {
            state.theBusiness = business
        },
        setResourceGroup(state, name) {
            state.resource_group = name
        },
        setResourcesName(state, name) {
            state.resourcesName = name
        },
        setShowBusiness(state, st) {
            state.showBusiness = st
        },
        setBusinessData(state, st) {
            state.businessData = st
        },
        setBreadCrumb(state, route) {
            state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
        },
        setHomeRoute(state, routes) {
            state.homeRoute = getHomeRoute(routes, homeName)
        },
        setTagNavList(state, list) {
            let tagList = []
            if (list) {
                tagList = [...list]
            } else tagList = getTagNavListFromLocalstorage() || []
            if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
            let homeTagIndex = tagList.findIndex(item => item.name === homeName)
            if (homeTagIndex > 0) {
                let homeTag = tagList.splice(homeTagIndex, 1)[0]
                tagList.unshift(homeTag)
            }
            state.tagNavList = tagList
            setTagNavListInLocalstorage([...tagList])
        },
        closeTag(state, route) {
            let tag = state.tagNavList.filter(item => routeEqual(item, route))
            route = tag[0] ? tag[0] : null
            if (!route) return
            closePage(state, route)
        },
        addTag(state, { route, type = 'unshift' }) {
            let router = getRouteTitleHandled(route)
            if (!routeHasExist(state.tagNavList, router)) {
                if (type === 'push') state.tagNavList.push(router)
                else {
                    if (router.name === homeName) state.tagNavList.unshift(router)
                    else state.tagNavList.splice(1, 0, router)
                }
                setTagNavListInLocalstorage([...state.tagNavList])
            }
        },
        setLocal(state, lang) {
            localSave('local', lang)
            state.local = lang
        },
        addError(state, error) {
            state.errorList.push(error)
        },
        setHasReadErrorLoggerStatus(state, status = true) {
            state.hasReadErrorPage = status
        }
    },
    actions: {
        handlerSelectBusiness({ commit }, data) {
            return new Promise((resolve, reject) => {
                changeBusiness(data).then(res => {
                    let resData = res.data.data
                    commit('setBusiness', resData.business_id)
                    commit('setResourcesName', resData.resource_group)
                    commit('setResourceGroup', resData.resource_group)
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        handlerGetBusinessList({ commit }) {
            return new Promise((resolve, reject) => {
                existBusinesslist().then(res => {
                    commit('setBusinessData', res.data.data)
                    commit('setResourceGroup', res.data.the_biz_map.resource_group)
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        addErrorLog({ commit, rootState }, info) {
            if (!window.location.href.includes('error_logger_page')) commit('setHasReadErrorLoggerStatus', false)
            const { user: { token, userId, userName } } = rootState
            let data = {
                    ...info,
                    time: Date.parse(new Date()),
                    token,
                    userId,
                    userName
                }
                // saveErrorLogger(info).then(() => {
                //     commit('addError', data)
                // })
        }
    }
}