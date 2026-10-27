<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login as loginApi } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value) {
    window.alert('请输入用户名')
    return
  }
  loading.value = true
  try {
    const res = await loginApi(username.value)
    userStore.login({ token: res.token, user: res.user })
    router.push('/books')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="card">
      <div class="logo">📚</div>
      <h2>图书系统登录</h2>
      <p class="tip">图书借阅管理系统</p>
      <input v-model="username" type="text" placeholder="请输入用户名" />
      <button class="btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(150deg, #4b7d74 0%, #6a9a8e 55%, #8fb0a4 100%);
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 360px;
  padding: 48px 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.logo {
  font-size: 56px;
}
h2 {
  margin: 0;
  color: #333;
}
.tip {
  margin: 0 0 8px;
  color: #999;
  font-size: 14px;
}
input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}
input:focus {
  border-color: #5f8f84;
}
.btn {
  width: 100%;
  padding: 12px;
  color: #fff;
  font-size: 16px;
  background: linear-gradient(135deg, #4b7d74, #5f8f84);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn:hover {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>