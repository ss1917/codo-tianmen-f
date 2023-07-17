import axios from '@/libs/api.request'

// 获取通知模板列表
export const getNoticeTemplate = (page, limit, searchValue) => {
    return axios.request({
        url: '/mg/v3/notifications/template/',
        method: 'get',
        params: {
            page,
            limit,
            searchValue
        }
    })
}

export const optNoticeTemplate = (data, action) => {
    return axios.request({
        url: '/mg/v3/notifications/template/',
        method: action,
        data
    })
}

//
export const sendNotice = (data, action) => {
    return axios.request({
        url: '/mg/v3/notifications/factory/',
        method: action,
        data
    })
}


// 获取通知组列表
export const getNoticeGroup = (page, limit, searchValue) => {
    return axios.request({
        url: '/mg/v3/notifications/group/',
        method: 'get',
        params: {
            page,
            limit,
            searchValue
        }
    })
}

export const optNoticeGroup = (data, action) => {
    return axios.request({
        url: '/mg/v3/notifications/group/',
        method: action,
        data
    })
}


// 获取通知配置
export const getNoticeConfig = (page, limit, searchValue) => {
    return axios.request({
        url: '/mg/v3/notifications/config/',
        method: 'get',
        params: {
            page,
            limit,
            searchValue
        }
    })
}

export const optNoticeConfig = (data, action) => {
    return axios.request({
        url: '/mg/v3/notifications/config/',
        method: action,
        data
    })
}