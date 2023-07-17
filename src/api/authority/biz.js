import axios from '@/libs/api.request'

// 业务列表页
export const getBusinesslist = (page, limit, value) => {
    return axios.request({
        url: '/mg/v1/base/biz/',
        method: 'get',
        params: {
            page,
            limit,
            value
        }
    })
}

export const optBusiness = (data, action) => {
    return axios.request({
        url: '/mg/v1/base/biz/',
        method: action,
        data
    })
}