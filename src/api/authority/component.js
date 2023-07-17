import axios from '@/libs/api.request'

// 组件
export const getComponentlist = (page, limit, searchValue, app_code) => {
    return axios.request({
        url: '/mg/v3/accounts/components/',
        method: 'get',
        params: {
            page,
            limit,
            app_code,
            searchValue
        }
    })
}

export const optComponent = (data, action) => {
    return axios.request({
        url: '/mg/v3/accounts/components/',
        method: action,
        data
    })
}