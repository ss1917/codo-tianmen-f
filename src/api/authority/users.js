import axios from '@/libs/api.request'

export const getuserlist = (page, limit, searchValue) => {
    return axios.request({
        url: '/mg/v3/accounts/user/',
        method: 'get',
        params: {
            page,
            limit,
            searchValue
        }
    })
}

export const optUserInfo = (data, action) => {
    return axios.request({
        url: '/mg/v3/accounts/user/',
        method: action,
        data
    })
}

// reset
export const resetMFA = (data) => {
    return axios.request({
        url: '/mg/v3/accounts/reset_mfa/',
        method: 'put',
        data
    })
}

export const resetPassword = (data) => {
    return axios.request({
        url: '/mg/v3/accounts/reset_pw/',
        method: 'put',
        data
    })
}

// token
export const getToken = (data) => {
    return axios.request({
        url: '/mg/v3/accounts/token/',
        method: 'post',
        data
    })
}
