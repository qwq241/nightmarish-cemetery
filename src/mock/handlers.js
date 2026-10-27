// MSW mock 接口定义
import { http, HttpResponse, delay } from 'msw'

// 模拟数据库（持久化到 localStorage，刷新后数据不丢失）
const STORAGE_KEY = 'mock_books'
// 数据版本：用于识别初始数据集是否更新，本地版本不一致则重置
const STORAGE_VERSION = 'v4'
const INITIAL_BOOKS = [
  { id: 1, title: '《Vue3 实战》', author: '张三', available: true, count: 5, rating: 4.5 },
  { id: 2, title: '《JavaScript 高级程序设计》', author: 'Nicholas', available: false, count: 2, rating: 4 },
  { id: 3, title: '《深入浅出 Node.js》', author: '朴灵', available: true, count: 8, rating: 4.5 },
  { id: 4, title: '《CSS 揭秘》', author: 'Lea Verou', available: true, count: 3, rating: 5 },
  { id: 5, title: '《深入理解 ES6》', author: 'Nicolas Zakas', available: true, count: 6, rating: 4 },
  { id: 6, title: '《Vue.js 权威指南》', author: '尤雨溪团队', available: false, count: 4, rating: 4.5 },
  { id: 7, title: '《React 学习之道》', author: 'Robin Wieruch', available: true, count: 7, rating: 3.5 },
  { id: 8, title: '《TypeScript 深入浅出》', author: '李博', available: true, count: 5, rating: 4 },
  { id: 9, title: '《Node.js 设计模式》', author: 'Mario Casciaro', available: false, count: 3, rating: 4.5 },
  { id: 10, title: '《Webpack 实战》', author: '王朝阳', available: true, count: 9, rating: 4 },
  { id: 11, title: '《HTTP 权威指南》', author: 'David Gourley', available: true, count: 4, rating: 5 },
  { id: 12, title: '《深入理解计算机系统》', author: 'Randal Bryant', available: false, count: 2, rating: 5 },
  { id: 13, title: '《你不知道的 JavaScript》', author: 'Kyle Simpson', available: true, count: 6, rating: 4.5 },
  { id: 14, title: '《算法图解》', author: 'Aditya Bhargava', available: true, count: 10, rating: 4 },
  { id: 15, title: '《Vue 开发实践》', author: '刘跃', available: true, count: 7, rating: 4 }
]

// 从 localStorage 恢复数据，无则用初始数据
function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // 版本一致且数据结构正确时才复用本地数据，否则用初始数据
      if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.books)) {
        return parsed
      }
    }
  } catch { /* ignore parse errors */ }
  return { version: STORAGE_VERSION, books: [...INITIAL_BOOKS], nextId: INITIAL_BOOKS.length + 1 }
}

function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, books, nextId }))
}

const initial = loadDB()
let nextId = initial.nextId
let books = initial.books

// 分页工具函数
function paginate(list, page = 1, size = 5) {
  const start = (page - 1) * size
  return { list: list.slice(start, start + size), total: list.length }
}

export const handlers = [
  // 1) 登录：POST /api/login 返回 token 和用户信息
  http.post('/api/login', async ({ request }) => {
    const { username } = await request.json()
    return HttpResponse.json({
      code: 0,
      token: 'mock-token-' + Date.now(),
      user: { id: 1, name: username || 'guest' }
    })
  }),

  // 2) 图书列表：GET /api/books 支持分页 + 关键字过滤
  http.get('/api/books', async ({ request }) => {
    // 模拟网络延迟，让表格 loading 遮罩明显可见
    await delay(800)

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 5
    const keyword = (url.searchParams.get('keyword') || '').trim()

    // 按书名/作者关键字过滤
    let filtered = books
    if (keyword) {
      filtered = books.filter(
        (b) => b.title.includes(keyword) || b.author.includes(keyword)
      )
    }

    // 分页切片
    const { list, total } = paginate(filtered, page, pageSize)
    return HttpResponse.json({ code: 0, list, total, page, pageSize })
  }),

  // 3) 新增图书：POST /api/books
  http.post('/api/books', async ({ request }) => {
    const body = await request.json()
    const book = { id: nextId++, available: true, ...body }
    books.push(book)
    saveDB()
    return HttpResponse.json({ code: 0, book })
  }),

  // 4) 编辑图书：PUT /api/books/:id
  http.put('/api/books/:id', async ({ params, request }) => {
    const body = await request.json()
    const id = Number(params.id)
    const index = books.findIndex((b) => b.id === id)
    if (index === -1) return HttpResponse.json({ code: 1, msg: '图书不存在' }, { status: 404 })
    books[index] = { ...books[index], ...body }
    saveDB()
    return HttpResponse.json({ code: 0, book: books[index] })
  }),

  // 5) 删除图书：DELETE /api/books/:id
  http.delete('/api/books/:id', ({ params }) => {
    const id = Number(params.id)
    const index = books.findIndex((b) => b.id === id)
    if (index === -1) return HttpResponse.json({ code: 1, msg: '图书不存在' }, { status: 404 })
    books.splice(index, 1)
    saveDB()
    return HttpResponse.json({ code: 0 })
  }),

  // 观察响应拦截器：服务端错误，返回 HTTP 500
  http.get('/api/error500', () => {
    return HttpResponse.json(
      { code: 1, msg: '服务器开小差了' },
      { status: 500 }
    )
  }),

  // 观察响应拦截器：缺少 Authorization 返回 401，带有效 token 才放行
  http.get('/api/protected', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ code: 401, msg: '未登录或登录已失效' }, { status: 401 })
    }
    return HttpResponse.json({ code: 0, data: { secret: '授权数据' } })
  })
]