<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getBooks, addBook, updateBook, deleteBook } from '@/api/book'
import request from '@/utils/request'
import MyPagination from '@/components/MyPagination.vue'

const router = useRouter()
const userStore = useUserStore()

// 表格数据与加载状态
const books = ref([])
const loading = ref(false)
const saving = ref(false)

// 搜索关键字与分页状态
const keyword = ref('')
const page = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 新增 / 编辑弹窗
const showDialog = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const form = ref({ title: '', author: '', rating: 0, available: true, count: 1 })
const emptyForm = { title: '', author: '', rating: 0, available: true, count: 1 }

// 校验规则：书名、作者必填
const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }]
}

// 拉取图书列表：携带搜索关键字与分页参数
async function loadBooks() {
  loading.value = true
  try {
    const res = await getBooks({ page: page.value, pageSize: pageSize.value, keyword: keyword.value })
    books.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

onMounted(loadBooks)

// 搜索：重置到第一页并重新请求
function handleSearch() {
  page.value = 1
  loadBooks()
}

// 打开新增弹窗
function openAdd() {
  editingId.value = null
  form.value = { ...emptyForm }
  showDialog.value = true
}

// 打开编辑弹窗，预填当前数据
function openEdit(book) {
  editingId.value = book.id
  form.value = {
    title: book.title,
    author: book.author,
    rating: book.rating ?? 0, // 评分
    available: book.available ?? true, // 是否上架
    count: book.count
  }
  showDialog.value = true
}

// 保存（新增或更新）：先校验，通过后再调接口
async function handleSave() {
  try {
    await formRef.value.validate() // 校验失败会抛出异常
  } catch {
    return // 校验未通过，直接返回
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateBook(editingId.value, { ...form.value })
    } else {
      await addBook({ ...form.value })
    }
    showDialog.value = false // 成功后关弹窗并刷新列表
    await loadBooks()
  } finally {
    saving.value = false
  }
}

// 删除图书：ElMessageBox 二次确认后调接口并刷新
async function handleDelete(book) {
  try {
    await ElMessageBox.confirm(`确定删除《${book.title}》？`, '提示', {
      type: 'warning'
    })
  } catch {
    return // 用户取消删除
  }
  await deleteBook(book.id)
  ElMessage.success('删除成功')
  await loadBooks()
}

// 退出登录
function handleLogout() {
  userStore.logout()
  router.push('/login')
}

// 观察响应拦截器：HTTP 500
async function testError() {
  try {
    await request.get('/error500')
  } catch {
    /* 拦截器已弹出提示 */
  }
}

// 观察响应拦截器：401 会清空登录态并跳回登录页
async function testProtected() {
  try {
    await request.get('/protected')
  } catch {
    /* 拦截器已处理 */
  }
}
</script>

<template>
  <div class="card">
    <div class="card-head">
      <h2>📖 图书列表</h2>
      <div class="head-actions">
        <el-button type="warning" plain round @click="testError">测试 500</el-button>
        <el-button type="info" plain round @click="testProtected">测试 401</el-button>
        <el-button type="primary" round @click="openAdd">新增图书</el-button>
        <el-button type="danger" plain round @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <!-- 搜索工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索书名/作者"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" dashed round @click="handleSearch">搜索</el-button>
    </div>

    <!-- 图书表格：el-table 绑定数据，el-empty 展示空态 -->
    <el-table v-loading="loading" :data="books" style="width: 100%">
      <el-table-column prop="title" label="书名" min-width="180" />
      <el-table-column prop="author" label="作者" min-width="140" />
      <el-table-column label="评分" width="140">
        <template #default="{ row }">
          <el-rate :model-value="row.rating ?? 0" disabled />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.available ? 'success' : 'info'">
            {{ row.available ? '上架中' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="库存" width="80" />
      <el-table-column label="操作" min-width="160">
        <template #default="{ row }">
          <el-button size="small" type="primary" plain round @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" plain round @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- 通用分页组件：切换时 emit change 触发重新请求 -->
    <div class="pagination">
      <MyPagination
        v-model:page="page"
        v-model:pageSize="pageSize"
        :total="total"
        @change="loadBooks"
      />
    </div>
  </div>

  <!-- 新增 / 编辑弹窗：el-form 带校验 -->
  <el-dialog v-model="showDialog" :title="editingId ? '编辑图书' : '新增图书'" width="420px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="60px">
      <el-form-item label="书名" prop="title">
        <el-input v-model="form.title" placeholder="请输入书名" />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入作者" />
      </el-form-item>
      <el-form-item label="评分">
        <el-rate v-model="form.rating" />
      </el-form-item>
      <el-form-item label="上架">
        <el-switch v-model="form.available" active-text="上架" inactive-text="下架" />
      </el-form-item>
      <el-form-item label="库存">
        <el-input-number v-model="form.count" :min="0" :max="9999" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button plain dashed round @click="showDialog = false">取消</el-button>
      <el-button type="success" circle :loading="saving" @click="handleSave">
        ✓
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  padding: 16px 20px;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.card-head h2 {
  margin: 0;
  color: #333;
}
.head-actions {
  display: flex;
  gap: 8px;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>