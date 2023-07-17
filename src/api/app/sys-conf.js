import axios from '@/libs/api.request'

// 系统配置项
// 发布应用选择
export const getSysconfig = (value) => {
    return axios.request({
        url: `/api/p/v3/sysconfig/settings/${value}/`,
        method: 'get'
    })
}

export const operationSysconfig = (data, meth) => {
        return axios.request({
            url: '/api/p/v3/sysconfig/settings/set/',
            method: 'post',
            data
        })
    }
    // 检查配置
export const CheckSysconfig = (data) => {
    return axios.request({
        url: '/api/p/v3/sysconfig/check/',
        method: 'post',
        data
    })
}
