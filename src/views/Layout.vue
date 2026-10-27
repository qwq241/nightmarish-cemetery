<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const menus = [
  { to: '/books', label: '📖 图书列表' },
  { to: '/records', label: '📋 借阅记录' }
]

function handleLogout() {
  userStore.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-icon">📚</span>
        <span>图书借阅系统</span>
      </div>
      <div class="user-info">
        <span class="user-name">👤 {{ userStore.username }}</span>
      </div>
      <nav>
        <RouterLink
          v-for="menu in menus"
          :key="menu.to"
          :to="menu.to"
          class="menu-item"
        >
          {{ menu.label }}
        </RouterLink>
      </nav>
      <button class="logout" @click="handleLogout">🚪 退出登录</button>
    </aside>
    <main class="content">
      <div class="page-header">
        <h1>{{ route.meta.title }}</h1>
      </div>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: 24px 0;
  color: #fff;
  background: linear-gradient(180deg, #2c3e50, #1a2733);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px 20px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.brand-icon {
  font-size: 24px;
}
.user-info {
  padding: 14px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.user-name {
  color: #ecf0f1;
  font-size: 14px;
}
nav {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px 12px;
  gap: 4px;
}
.menu-item {
  padding: 12px 16px;
  color: #b3c0d1;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
}
.menu-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}
.menu-item.router-link-active {
  color: #fff;
  background: #409eff;
}
.logout {
  margin: 0 12px;
  padding: 12px;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.logout:hover {
  background: rgba(231, 76, 60, 0.2);
}
.content {
  flex: 1;
  padding: 24px 32px;
  background: #f5f7fa;
  overflow: auto;
}
.page-header h1 {
  margin: 0 0 20px;
  font-size: 22px;
  color: #333;
}
</style>