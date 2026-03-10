import { defineStore } from 'pinia'

// 使用 defineStore 定义 store
export const useCounterStore = defineStore('counter', {
  // 状态 (相当于 data)
  state: () => ({
    count: 0,
    name: 'Eduardo'
  }),
  
  // 计算属性 (相当于 getters)
  getters: {
    doubleCount: (state) => state.count * 2,
    // 使用其他 getter
    doubleCountPlusOne() {
      return this.doubleCount + 1
    }
  },
  
  // 操作方法 (相当于 actions)
  actions: {
    increment() {
      this.count++
    },
    randomizeCounter() {
      this.count = Math.round(100 * Math.random())
    }
  }
})