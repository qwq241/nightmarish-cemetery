import request from '@/utils/request'

// 列表查询：支持分页与关键字过滤
export const getBooks = ({ page = 1, pageSize = 5, keyword = '' } = {}) =>
  request.get('/books', { params: { page, pageSize, keyword } })

export const addBook = (data) => request.post('/books', data)

export const updateBook = (id, data) => request.put(`/books/${id}`, data)

export const deleteBook = (id) => request.delete(`/books/${id}`)