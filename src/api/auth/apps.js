import axios from '@/libs/api.request'

// 获取应用列表
export const getApplist = (params) => {
  return axios.request({
    url: '/api/p/v4/apps/',
    method: 'get',
    params
  })
}

export const optApp = (data, action) => {
  return axios.request({
    url: '/api/p/v4/apps/',
    method: action,
    data
  })
}

export const getAppByRole = (params) => {
    return axios.request({
        url: '/api/p/v4/role_app/',
        method: 'get',
        params
    })
}

export const optRoleApp = (data, action) => {
    return axios.request({
        url: '/api/p/v4/role_app/',
        method: action,
        data
    })
}
