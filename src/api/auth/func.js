import axios from '@/libs/api.request'

// 获取用户后端权限列表
export const getFuncList = (params) => {
    return axios.request({
        url: '/api/p/v4/func/',
        method: 'get',
        params
    })
}

export const optFunc = (data, action) => {
    return axios.request({
        url: '/api/p/v4/func/',
        method: action,
        data
    })
}

export const getFuncByRole = (params) => {
    return axios.request({
        url: '/api/p/v4/role_func/',
        method: 'get',
        params
    })
}

export const optRoleFunc = (data, action) => {
    return axios.request({
        url: '/api/p/v4/role_func/',
        method: action,
        data
    })
}
