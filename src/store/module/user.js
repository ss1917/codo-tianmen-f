import {
    login,
    register,
    logout,
    getUserInfo,
    getMessage,
    getContentByMsgId,
    hasRead,
    removeReaded,
    restoreTrash,
    authorization,
    getUnreadCount
} from '@/api/user'
import { setToken, getToken } from '@/libs/util'
import loveJpg from '@/assets/images/love.jpg'

export default {
    state: {
        userName: '',
        nickName: '',
        userId: '',
        avatorImgPath: loveJpg,
        token: getToken(),
        access: '',
        rules: {},
        hasGetInfo: false,
        unreadCount: 0,
        messageUnreadList: [],
        messageReadedList: [],
        messageTrashList: [],
        messageContentStore: {}
    },
    mutations: {
        setAvatar(state, avatarPath) {
            state.avatarImgPath = avatarPath
        },
        setUserId(state, id) {
            state.userId = id
        },
        setUserName(state, name) {
            state.userName = name
        },
        setNickName(state, name) {
            state.nickName = name
        },
        setAccess(state, access) {
            state.access = access
        },
        setToken(state, token) {
            state.token = token
            setToken(token)
        },
        setHasGetInfo(state, status) {
            state.hasGetInfo = status
        },
        setMessageCount(state, count) {
            state.unreadCount = count
        },
        setMessageUnreadList(state, list) {
            state.messageUnreadList = list
        },
        setMessageReadedList(state, list) {
            state.messageReadedList = list
        },
        setMessageTrashList(state, list) {
            state.messageTrashList = list
        },
        updateMessageContentStore(state, { msg_id, content }) {
            state.messageContentStore[msg_id] = content
        },
        moveMsg(state, { from, to, msg_id }) {
            const index = state[from].findIndex(_ => _.msg_id === msg_id)
            const msgItem = state[from].splice(index, 1)[0]
            msgItem.loading = false
            state[to].unshift(msgItem)
        },
        SET_RULES(state, rules) {
            state.rules = rules
        }
    },
    getters: {
        messageUnreadCount: state => state.messageUnreadList.length,
        messageReadedCount: state => state.messageReadedList.length,
        messageTrashCount: state => state.messageTrashList.length
    },
    actions: {
        // 登录
        handleLogin({ commit }, { username, password, dynamic, c_url }) {
            username = username.trim()
            password = password.trim()
            password = window.btoa(window.btoa(password))
            return new Promise((resolve, reject) => {
                login({ username, password, dynamic, c_url }).then(res => {
                    const data = res.data
                    if (data.code === 0) {
                        commit('setToken', data.auth_key)
                        commit('setUserName', data.username)
                        commit('setNickName', data.nickname)
                    }
                    resolve(data)
                }).catch(err => {
                    reject(err)
                })
            })
        },
        // 退出登录
        handleLogOut({ state, commit }) {
            return new Promise((resolve, reject) => {
                commit('setToken', '')
                commit('setAccess', [])
                resolve()
            })
        },

        // authorization({ commit }, token) {
        //     return new Promise((resolve, reject) => {
        //         authorization().then(res => {
        //             if (parseInt(res.status) === 401) {
        //                 commit('setToken', '')
        //                 commit('setAccess', [])
        //                 reject(new Error('token error'))
        //             } else {
        //                 resolve(res.data.data.rules.page)
        //                 commit('SET_RULES', res.data.data.rules.component)
        //             }
        //         }).catch(error => {
        //             reject(error)
        //         })
        //     })
        // },
        authorization({ commit }, token) {
          return new Promise((resolve, reject) => {
                if (process.env.NODE_ENV === 'development' && !window.__POWERED_BY_QIANKUN__) {
                    resolve([])
                }
                authorization().then(res => {
                    if (parseInt(res.status) === 401) {
                        commit('setToken', '')
                        commit('setAccess', [])
                        reject(new Error('token error'))
                    } else {
                        const data = res.data.data
                        resolve(data.rules.page)
                            //
                        commit('setUserName', data.username)
                        commit('setNickName', data.nickname)
                        if (data.user_info && data.user_info.avatar) {
                            commit('setAvatar', data.user_info.avatar)
                        }
                        commit('SET_RULES', data.rules.component)
                    }
                }).catch(error => {
                    // console.log('error----------', JSON.parse(JSON.stringify(error)))
                    reject(error)
                })
            })
        },
        handlePassword({ commit }, data) {
            return new Promise((resolve, reject) => {
                password(data).then(res => {
                    if (res.data.code === 0) {
                        commit('setToken', '')
                        commit('setAccess', [])
                    }
                    resolve(res.data)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        handleRegister({ commit }, data) {
          console.info('handleRegister')
            return new Promise((resolve, reject) => {
                register(data).then(res => {
                    commit('setToken', '')
                    commit('setAccess', [])
                    resolve(res.data)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 此方法用来获取未读消息条数，接口只返回数值，不返回消息列表
        getUnreadMessageCount({ state, commit }) {
            getUnreadCount().then(res => {
                const { data } = res
                commit('setMessageCount', data)
            })
        },
        // 获取消息列表，其中包含未读、已读、回收站三个列表
        getMessageList({ state, commit }) {
            return new Promise((resolve, reject) => {
                getMessage().then(res => {
                    const { unread, readed, trash } = res.data
                    commit('setMessageUnreadList', unread.sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
                    commit('setMessageReadedList', readed.map(_ => {
                        _.loading = false
                        return _
                    }).sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
                    commit('setMessageTrashList', trash.map(_ => {
                        _.loading = false
                        return _
                    }).sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 根据当前点击的消息的id获取内容
        getContentByMsgId({ state, commit }, { msg_id }) {
            return new Promise((resolve, reject) => {
                let contentItem = state.messageContentStore[msg_id]
                if (contentItem) {
                    resolve(contentItem)
                } else {
                    getContentByMsgId(msg_id).then(res => {
                        const content = res.data
                        commit('updateMessageContentStore', { msg_id, content })
                        resolve(content)
                    })
                }
            })
        },
        // 把一个未读消息标记为已读
        hasRead({ state, commit }, { msg_id }) {
            return new Promise((resolve, reject) => {
                hasRead(msg_id).then(() => {
                    commit('moveMsg', {
                        from: 'messageUnreadList',
                        to: 'messageReadedList',
                        msg_id
                    })
                    commit('setMessageCount', state.unreadCount - 1)
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 删除一个已读消息到回收站
        removeReaded({ commit }, { msg_id }) {
            return new Promise((resolve, reject) => {
                removeReaded(msg_id).then(() => {
                    commit('moveMsg', {
                        from: 'messageReadedList',
                        to: 'messageTrashList',
                        msg_id
                    })
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 还原一个已删除消息到已读消息
        restoreTrash({ commit }, { msg_id }) {
            return new Promise((resolve, reject) => {
                restoreTrash(msg_id).then(() => {
                    commit('moveMsg', {
                        from: 'messageTrashList',
                        to: 'messageReadedList',
                        msg_id
                    })
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        }
    }
}
