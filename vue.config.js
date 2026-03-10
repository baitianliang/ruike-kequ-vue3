const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  lintOnSave: false,
  publicPath: './',
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://192.168.2.206:8090/pms/',
        // target: 'http://192.168.2.128:9090/pms/',
        // target: 'http://192.168.1.7:9090/pms/',
        target: 'https://pms.chint.com/primelayer/',
        // target: 'http://192.168.88.129/pms/',
        changeOrigin: true,
        pathRewrite: {
            '^/api': '',
        },
      },
    },
  }
})
