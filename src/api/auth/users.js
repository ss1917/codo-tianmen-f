
import axios from '@/libs/api.request'

export const getUserList = (params) => {
    return axios.request({
        url: '/api/p/v4/user/',
        method: 'get',
        params
    })
}

export const optUser = (data, action) => {
    return axios.request({
        url: '/api/p/v4/user/',
        method: action,
        data
    })
}

// reset
export const resetMFA = (data) => {
    return axios.request({
        url: '/api/p/v4/reset_mfa/',
        method: 'put',
        data
    })
}

export const resetPassword = (data) => {
    return axios.request({
        url: '/api/p/v4/reset_pw/',
        method: 'put',
        data
    })
}

// token
export const getToken = (data) => {
    return axios.request({
        url: '/api/p/v4/token/',
        method: 'post',
        data
    })
}
