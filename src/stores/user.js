import { defineStore } from 'pinia'

// 持久化 key
const STORAGE_KEY = 'user_state'

// 从 localStorage 恢复持久化的 state
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore parse errors */ }
  return null
}

// 用户状态 store
export const useUserStore = defineStore('user', {
  state: () => {
    return loadState() || { token: '', userInfo: { name: '', role: '' } }
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo.name
  },

  actions: {
    // 登录：接收接口返回的 token 与用户信息并持久化
    login({ token, user }) {
      this.token = token
      this.userInfo = { name: user?.name || '', role: user?.role || '读者' }
      this._persist()
    },
    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = { name: '', role: '' }
      this._persist()
    },
    // 手动触发持久化写入
    _persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        token: this.token,
        userInfo: { ...this.userInfo }
      }))
    }
  }
})