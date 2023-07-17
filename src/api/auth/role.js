import axios from '@/libs/api.request'

export const getRoleList = (params) => {
    return axios.request({
        url: '/api/p/v4/role/',
        method: 'get',
        params
    })
}



export const optRole = (data, action) => {
    return axios.request({
        url: '/api/p/v4/role/',
        method: action,
        data
    })
}

//通过角色获取用户
export const getUserByRole = (params) => {
    return axios.request({
        url: '/api/p/v4/role_user/',
        method: 'get',
        params
    })
}

export const optRoleUser = (data, action) => {
    return axios.request({
        url: '/api/p/v4/role_user/',
        method: action,
        data
    })
}

export const syncRole = (data) => {
    return axios.request({
        url: '/api/p/v4/role/sync/',
        method: 'post',
        data
    })
}


//通过角色获取权限
export const getFuncsByRole = (role_id) => {
    return axios.request({
        url: '/api/p/v3/accounts/role_func/',
        method: 'get',
        params: {
            role_id
        }
    })
}

export const optRoleFunc = (data, action) => {
    return axios.request({
        url: '/api/p/v3/accounts/role_func/',
        method: action,
        data
    })
}

//通过角色获取菜单
export const getMenusByRole = (role_id) => {
    return axios.request({
        url: '/api/p/v3/accounts/role_menu/',
        method: 'get',
        params: {
            role_id
        }
    })
}

export const optRoleMenu = (data, method) => {
    return axios.request({
        url: '/api/p/v3/accounts/role_menu/',
        method,
        data
    })
}

//通过角色获取前端组件
export const getComponentByRole = (role_id) => {
    return axios.request({
        url: '/api/p/v3/accounts/role_comp/',
        method: 'get',
        params: {
            role_id
        }
    })
}


export const optRoleComponent = (data, method) => {
    return axios.request({
        url: '/api/p/v3/accounts/role_comp/',
        method,
        data
    })
}

//通过角色获取应用
export const getAppByRole = (role_id) => {
    return axios.request({
        url: '/api/p/v3/accounts/role_app/',
        method: 'get',
        params: {
            role_id
        }
    })
}


export const optRoleApp = (data, method) => {
    return axios.request({
        url: '/api/p/v3/accounts/role_app/',
        method,
        data
    })
}
