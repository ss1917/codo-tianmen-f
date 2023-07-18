import axios from '@/libs/api.request'

export const login = (data) => {
  return axios.request({
    url: '/api/p/v4/login/',
    method: 'post',
    data
  })
}

export const logout = () => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}

export const authorization = () => {
  return axios.request({
    url: '/api/p/v4/authorization/',
    method: 'get'
  })
}

// export const password = (data) => {
//     return axios.request({
//         url: '/v2/accounts/password/',
//         method: 'patch',
//         data
//     })
// }

export const register = (data) => {
  return axios.request({
    url: '/api/p/v3/accounts/register/',
    method: 'post',
    data
  })
}
