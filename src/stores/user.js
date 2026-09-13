import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi, updateProfile as updateProfileApi } from '@/api/heritage'

const TOKEN_KEY = 'heritage_token'
const USER_KEY = 'heritage_user'

/**
 * 用户状态仓库（Pinia）
 * 跨页面共享：登录状态在导航守卫（router/index.js）和个人中心、收藏页都要读取
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    // 初始化时从 localStorage 恢复，刷新页面不丢失登录态
    token: localStorage.getItem(TOKEN_KEY) || '',
    userInfo: JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    nickname: (state) => state.userInfo?.nickname || '游客',
    username: (state) => state.userInfo?.username || ''
  },

  actions: {
    /** 登录：调用 Mock 接口 → 保存 token 和用户信息 → 同步到 localStorage */
    async login(form) {
      const data = await loginApi(form)
      this.token = data.token
      this.userInfo = data.userInfo
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.userInfo))
      return data.userInfo
    },

    /** 注册 */
    async register(form) {
      const data = await registerApi(form)
      return data
    },

    /** 修改资料：服务端更新成功后同步本地缓存中的 userInfo */
    async updateProfile(form) {
      const userInfo = await updateProfileApi(form)
      this.userInfo = { ...this.userInfo, ...userInfo }
      localStorage.setItem(USER_KEY, JSON.stringify(this.userInfo))
      return this.userInfo
    },

    /** 退出登录：清空 store 与 localStorage */
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }
})
