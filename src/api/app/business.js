import axios from '@/libs/api.request'

// 右上角用户可见的业务
export const existBusinesslist = () => {
    return axios.request({
        url: '/api/p/v1/base/biz/',
        method: 'get',
        params: {
            'page': 1,
            'limit': 300,
        }
    })
}

//切换业务
export const changeBusiness = (data) => {
    return axios.request({
        url: '/api/p/v1/base/biz/',
        method: 'patch',
        data
    })
}

// 业务列表页
export const getBusinesslist = (page, limit, value) => {
    return axios.request({
        url: '/api/p/v1/base/biz/',
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
        url: '/api/p/v1/base/biz/',
        method: action,
        data
    })
}
