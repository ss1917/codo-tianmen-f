import axios from 'axios'
import { Notice } from 'view-design'
import Cookies from 'js-cookie'
import { gotoUnAuth } from "@/libs/qiankun"
import { setToken, getToken } from '@/libs/util'
// import config from '@/config'
// const { isHttps } = config

class HttpRequest {
    constructor(baseUrl = baseURL) {
        this.baseUrl = baseUrl
        this.queue = {}
    }
    getInsideConfig() {
        let config = {
            baseURL: this.baseUrl,
            headers: {
                "X-CSRFToken": Cookies.get('csrftoken'),
                'X-Xsrftoken': Cookies.get('_xsrf'),
            }
        }
        if (getToken()) {
            config.headers['auth-key'] = getToken()
        }
        return config
    }
    destroy(url) {
        delete this.queue[url]
        if (!Object.keys(this.queue).length) {
            // Spin.hide()
        }
    }
    interceptors(instance, url) {
        // 请求拦截
        instance.interceptors.request.use(config => {
                // 添加全局的loading...
                if (!Object.keys(this.queue).length) {
                    // Spin.show() // 不建议开启，因为界面不友好
                }
                this.queue[url] = true
                return config
            }, error => {
                return Promise.reject(error)
            })
            // 响应拦截
        instance.interceptors.response.use(res => {
            this.destroy(url)
            const { data, status, request } = res
            return { data, status, request }
        }, error => {
            this.destroy(url)
             if (error.response.status === '401' || error.response.status === 401) {
              console.info('------------',window.__POWERED_BY_QIANKUN__)
                if (window.__POWERED_BY_QIANKUN__) {
                    gotoUnAuth()
                } else {
                    clearToken()
                    location.reload()
                }
            } else if (error.response.status === 403) {
                Notice.warning({
                    title: '你没有权限，请联系管理员',
                    desc: `${error.response.data}`
                })
            } else if (error.response.status === 402) {
                Notice.warning({
                    title: '请刷新页面后提交',
                    desc: `${error.response.data}`
                })
            } else if (error.response.status === 500) {
                Notice.error({
                    title: '服务内部错误，请联系管理员',
                    desc: `${error.response.data}`
                })
            }
            return Promise.reject(error)
        })
    }
    request(options) {
        const instance = axios.create()
        options = Object.assign(this.getInsideConfig(), options)
        this.interceptors(instance, options.url)
        return instance(options)
    }
}
export default HttpRequest
