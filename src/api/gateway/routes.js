import axios from '@/libs/api.request'

// 获取路由列表
export const getGwRoutelist = () => {
    return axios.request({
        url: '/api/admin/routes/list',
        method: 'get'
    })
}


export const saveGwRoute = (data, action) => {
    return axios.request({
        url: '/api/admin/routes/save',
        method: action,
        data
    })
}

export const delGwRoute = (data) => {
    return axios.request({
        url: '/api/admin/routes/remove',
        method: "delete",
        data
    })
}

export const getGwPluginlist = () => {
    return axios.request({
        url: '/api/admin/plugins/list',
        method: 'get'
    })
}
