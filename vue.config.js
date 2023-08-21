const path = require('path')
const { name } = require('./package')

const resolve = dir => {
  return path.join(__dirname, dir)
}
const port = 8085 // dev port
// const BASE_URL = process.env.NODE_ENV === 'production' ?  `/web/${name}/` : '/'
const BASE_URL =  `/web/${process.env.VUE_APP_CODE}/`
module.exports = {
  // baseUrl: BASE_URL,
  // publicPath: BASE_URL,
   publicPath: BASE_URL,
  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  // 如果你不需要使用eslint，把lintOnSave设为false即可
  // lintOnSave: false,
  lintOnSave: process.env.NODE_ENV !== 'production',
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
    config.module.rule('fonts').use('url-loader').loader('url-loader').options({}).end()
    config.module.rule('images').use('url-loader').loader('url-loader').options({}).end()
  },
  // 设为false打包时不生成.map文件
  productionSourceMap: false,
  // 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 '' ，即空字符串
  // devServer: {
  //   disableHostCheck: true,
  //   proxy: 'http://10.241.0.40:8888/api/',
  //   headers: {
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Headers': '*',
  //     'Access-Control-Allow-Methods': '*'
  //     // 'Access-Control-Allow-Credentials': true
  //   }
  // },
  devServer: {
    hot: true,
    disableHostCheck: true,
    port,
    overlay: {
      warnings: false,
      errors: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '^/api/': {
        target: 'http://10.241.0.40:8888/',
        changeOrigin: true,
      },
      // '^/api/p/': {
      //   target: 'http://10.241.8.14:8010',
      //   changeOrigin: true,
      //    pathRewrite: {'^/api/p': ''}
      //   // headers: { Authorization: "" },
      // },
      '^/api/admin/': {
        target: 'http://10.241.0.40:8888',
        changeOrigin: true,
        // pathRewrite: {'^/api': ''  }
        // headers: { Authorization: "" },
      },
    },
  },

  // 自定义webpack配置
  configureWebpack: {
    output: {
      // 把子应用打包成 umd 库格式
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`
    }
  }
}
