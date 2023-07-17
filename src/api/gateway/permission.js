import axios from '@/libs/api.request'

// 获取API权限列表
export const getGwAPIRule = () => {
    return axios.request({
        url: '/api/admin/rbac/list',
        method: 'get'
    })
}


// export const saveGwService = (data, action) => {
//     return axios.request({
//         url: '/admin/services/save',
//         method: action,
//         data
//     })
// }

export const delGwAPIRule = (data) => {
    return axios.request({
        url: '/api/admin/rbac/remove',
        method: "delete",
        data
    })
}
