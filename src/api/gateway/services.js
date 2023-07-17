import axios from '@/libs/api.request'

// 获取路由列表
export const getGwServices = () => {
    return axios.request({
        url: '/api/admin/services/list',
        method: 'get'
    })
}


export const saveGwService = (data, action) => {
    return axios.request({
        url: '/api/admin/services/save',
        method: action,
        data
    })
}

export const delGwService = (data) => {
    return axios.request({
        url: '/api/admin/services/remove',
        method: "delete",
        data
    })
}
