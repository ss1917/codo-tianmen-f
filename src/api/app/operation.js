import axios from '@/libs/api.request'

export const getLoglist = (page, limit, key, value, start_date, end_date) => {
    return axios.request({
        url: '/api/p/v3/app/opt_log/',
        method: 'get',
        params: {
            page,
            limit,
            key,
            value,
            start_date,
            end_date
        }
    })
}

export const getLoglist2 = (params) => {
    return axios.request({
        url: '/api/p/v4/app/opt_log/',
        method: 'get',
        params
    })
}
