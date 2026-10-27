<script setup>
// 通用分页组件：基于 el-pagination
// props: total(总数) / page(当前页) / pageSize(每页条数)
// v-model:page 与 v-model:pageSize 双向绑定当前页码和每页条数
// 翻页或切换条数时 emit "change"，由父组件监听后重新请求
defineProps({
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 5 }
})

const emit = defineEmits(['update:page', 'update:pageSize', 'change'])

// 翻页：更新页码并通知父组件刷新
function onChangePage(p) {
  emit('update:page', p)
  emit('change')
}

// 切换每页条数：重置到第一页并通知父组件刷新
function onChangeSize(size) {
  emit('update:pageSize', size)
  emit('update:page', 1)
  emit('change')
}
</script>

<template>
  <el-pagination
    :current-page="page"
    :page-size="pageSize"
    :total="total"
    layout="total, sizes, prev, pager, next"
    @current-change="onChangePage"
    @size-change="onChangeSize"
  />
</template>