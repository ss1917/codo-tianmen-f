import axios from '@/libs/api.request'

// 获取应用列表
export const getApplist = (page, limit, searchValue, all) => {
  return axios.request({
    url: '/mg/v4/apps/',
    method: 'get',
    params: {
      page,
      limit,
      all,
      searchValue
    }
  })
}

export const optApp = (data, action) => {
  return axios.request({
    url: '/mg/v4/apps/',
    method: action,
    data
  })
}
