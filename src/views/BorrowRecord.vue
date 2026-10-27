<script setup>
import { computed } from 'vue'

// 借阅记录数据
const records = [
  { id: 1, book: '《Vue3 实战》', user: '张三', borrowDate: '2026-10-01', dueDate: '2026-10-15', returned: false },
  { id: 2, book: '《JavaScript 高级程序设计》', user: '李四', borrowDate: '2026-10-12', dueDate: '2026-10-26', returned: false },
  { id: 3, book: '《深入浅出 Node.js》', user: '王五', borrowDate: '2026-09-20', dueDate: '2026-10-04', returned: true }
]

// 按「应还日期」分组，未归还的图书，用于日历展示
const dueMap = computed(() => {
  const map = {}
  records.forEach((r) => {
    if (!r.returned) {
      const key = r.dueDate
      if (!map[key]) map[key] = []
      map[key].push(r)
    }
  })
  return map
})

// 格式化日期为 YYYY-MM-DD，用于与日历日期比对
function fmt(dateStr) {
  const d = new Date(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
</script>

<template>
  <div>
    <!-- 借阅记录表格 -->
    <div class="card">
      <div class="card-head"><h2>📋 借阅记录</h2></div>
      <el-table :data="records" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="book" label="书名" />
        <el-table-column prop="user" label="借阅人" width="110" />
        <el-table-column prop="borrowDate" label="借阅日期" width="130" />
        <el-table-column prop="dueDate" label="应还日期" width="130" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.returned ? 'success' : 'warning'" effect="light">
              {{ row.returned ? '已归还' : '借出中' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 借阅日历 -->
    <div class="card" style="margin-top: 16px">
      <div class="card-head"><h2>📅 借阅日历</h2></div>
      <el-calendar>
        <template #date-cell="{ data }">
          <!-- 通过 el-tooltip 在当前日期上展示当天到期的图书 -->
          <el-tooltip
            v-if="dueMap[fmt(data.day)]"
            :content="dueMap[fmt(data.day)].map(r => `${r.book} · ${r.user}`).join('、')"
            placement="top"
          >
            <div class="cal-cell">
              <span>{{ data.day.split('-')[2] }}</span>
              <div class="due-list">
                <span class="due-dot" v-for="r in dueMap[fmt(data.day)]" :key="r.id"></span>
              </div>
            </div>
          </el-tooltip>
          <div v-else class="cal-cell">
            <span>{{ data.day.split('-')[2] }}</span>
          </div>
        </template>
      </el-calendar>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  padding-bottom: 16px;
}
.card-head {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}
.card-head h2 {
  margin: 0;
  color: #333;
}
/* 日历单元格：显示号数 + 到期红点 */
.cal-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-height: 48px;
  justify-content: center;
}
.due-list {
  display: flex;
  gap: 3px;
}
.due-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f56c6c;
}
</style>