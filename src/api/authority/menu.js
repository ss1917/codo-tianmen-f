import axios from '@/libs/api.request'

// 获取用户前端菜单
export const getMenuslist = (page, limit, searchValue, app_code) => {
    return axios.request({
        url: '/mg/v3/accounts/menus/',
        method: 'get',
        params: {
            page,
            limit,
            app_code,
            searchValue
        }
    })
}

export const operationMenu = (data, action) => {
    return axios.request({
        url: '/mg/v3/accounts/menus/',
        method: action,
        data
    })
}