import request from '@/utils/request'

export const login = (username) => request.post('/login', { username })