<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLogout() {
  localStorage.removeItem('library_token')
  router.replace('/login')
}
</script>

<template>
  <div class="layout">
    <!-- 侧边菜单 -->
    <aside class="sidebar">
      <h3>图书借阅系统</h3>
      <nav>
        <RouterLink to="/books">图书列表</RouterLink>
        <RouterLink to="/records">借阅记录</RouterLink>
      </nav>
      <button class="logout" @click="handleLogout">退出登录</button>
    </aside>
    <!-- 主内容区 -->
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 200px;
  padding: 20px;
  color: #fff;
  background: linear-gradient(180deg, #3a6b64 0%, #2f5550 100%);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.05);
}

/* 菜单项 */
.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar a {
  color: #dcebe8;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.sidebar a:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* 当前激活菜单高亮 */
.sidebar a.router-link-active {
  color: #fff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.18);
}

.logout {
  margin-top: auto;
  padding: 9px;
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.logout:hover {
  background: rgba(255, 255, 255, 0.28);
}

.content {
  flex: 1;
  padding: 28px;
  overflow: auto;
  background: transparent;
}
</style>