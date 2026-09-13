import axios from 'axios'
import { ElMessage } from 'element-plus'

/**
 * Axios 实例统一封装
 * baseURL 统一为 /api，所有请求都会被 Mock.js 拦截（见 src/mock/index.js）
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 8000
})

// 请求拦截器：每次请求自动携带 token（登录凭证）
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('heritage_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：
// 1. 成功时直接剥掉 axios 外层，并校验业务 code，页面里拿到的是后端的 data 字段
// 2. 业务失败 / 网络错误时统一弹出提示，并让 Promise 进入 rejected
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败，请稍后重试')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    ElMessage.error(error.response?.data?.message || '网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

export default request
