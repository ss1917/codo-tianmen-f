import axios from '@/libs/api.request'

// 获取用户前端菜单
export const getMenusList = (params) => {
    return axios.request({
        url: '/api/p/v4/menus/',
        method: 'get',
        params
    })
}

export const optMenu = (data, action) => {
    return axios.request({
        url: '/api/p/v4/menus/',
        method: action,
        data
    })
}

export const getMenuByRole = (params) => {
    return axios.request({
        url: '/api/p/v4/role_menu/',
        method: 'get',
        params
    })
}

export const optRoleMenu = (data, action) => {
    return axios.request({
        url: '/api/p/v4/role_menu/',
        method: action,
        data
    })
}
