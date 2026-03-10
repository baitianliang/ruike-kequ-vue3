module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16, // 1rem = 16px（基准值，需与 flexible.js 一致）
      propList: ['*'], // 转换所有 CSS 属性
      selectorBlackList: ['.norem'] // 过滤带有.norem的class不转换
    },
  },
}