// axios 实例封装
import axios from 'axios'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 创建实例：统一 baseURL 与超时
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器：从 user store 读 token 放入 Authorization 头
request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// 响应拦截器：按业务 code 处理
request.interceptors.response.use(
  (response) => {
    const { data } = response
    // 业务 code 200 / 0（成功）直接返回 data 部分
    if (data && (data.code === 200 || data.code === 0)) return data

    // 401：未登录/token 失效，清空登录态并跳登录页
    if (data && data.code === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
      return Promise.reject(new Error('登录已失效'))
    }
    return Promise.reject(new Error(data?.msg || '请求失败'))
  },
  (error) => {
    const status = error.response?.status
    // 401
    if (status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    } else if (status === 500) {
      // 500 提示服务器错误
      window.alert('服务器错误，请稍后重试')
    } else {
      window.alert(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request