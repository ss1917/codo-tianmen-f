import HttpRequest from '@/libs/axios'
import config from '@/config'
let baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
    // baseUrl = baseUrl + "/" + config.app_code
const axios = new HttpRequest(baseUrl)
export default axios