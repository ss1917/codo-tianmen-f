import axios from '@/libs/api.request'

// 组件
export const getComponentlist = (params) => {
    return axios.request({
        url: '/api/p/v4/components/',
        method: 'get',
        params
    })
}

export const optComponent = (data, action) => {
    return axios.request({
        url: '/api/p/v4/components/',
        method: action,
        data
    })
}


export const getCompByRole = (params) => {
    return axios.request({
        url: '/api/p/v4/role_comp/',
        method: 'get',
        params
    })
}

export const optRoleComponent = (data, action) => {
    return axios.request({
        url: '/api/p/v4/role_comp/',
        method: action,
        data
    })
}
