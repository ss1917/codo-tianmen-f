import axios from '@/libs/api.request'

// 获取应用列表
export const getLinklist = (params) => {
  return axios.request({
    url: '/api/p/v4/login/link/',
    method: 'get',
    params
  })
}

export const optLink = (data, action) => {
  return axios.request({
    url: '/api/p/v4/login/link/',
    method: action,
    data
  })
}
