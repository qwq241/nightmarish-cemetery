import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/books',
    children: [
      {
        path: 'books',
        name: 'BookList',
        component: () => import('@/views/BookList.vue'),
        meta: { title: '图书列表', requiresAuth: true }
      },
      {
        path: 'records',
        name: 'BorrowRecord',
        component: () => import('@/views/BorrowRecord.vue'),
        meta: { title: '借阅记录', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = useUserStore().isLoggedIn

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (to.path === '/login' && isLoggedIn) {
    next({ path: '/' })
    return
  }

  next()
})

export default router