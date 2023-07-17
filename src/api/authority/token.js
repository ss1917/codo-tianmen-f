import axios from '@/libs/api.request'

// 获取用户前端菜单
export const getTokenlist = (page, limit, searchValue) => {
    return axios.request({
        url: '/mg/v3/accounts/token/',
        method: 'get',
        params: {
            page,
            limit,
            searchValue
        }
    })
}

export const operationToken = (data, action) => {
    return axios.request({
        url: '/mg/v3/accounts/token/',
        method: action,
        data
    })
}