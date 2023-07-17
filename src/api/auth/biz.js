import axios from '@/libs/api.request'

// 业务列表页
export const getBizList = (params) => {
    return axios.request({
        url: '/api/p/v4/biz/',
        method: 'get',
        params
    })
}

export const optBiz = (data, action) => {
    return axios.request({
        url: '/api/p/v4/biz/',
        method: action,
        data
    })
}

// 租户列表页
export const getTenantList = (params) => {
    return axios.request({
        url: '/api/p/v4/tenant/',
        method: 'get',
        params
    })
}

// 租户
export const optTenant = (data, action) => {
    return axios.request({
        url: '/api/p/v4/tenant/',
        method: action,
        data
    })
}
