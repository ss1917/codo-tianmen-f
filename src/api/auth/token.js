import axios from '@/libs/api.request'

// 获取用户前端菜单
export const getTokenlist = (page, limit, searchValue) => {
    return axios.request({
        url: '/api/p/v4/token/',
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
        url: '/api/p/v4/token/',
        method: action,
        data
    })
}
