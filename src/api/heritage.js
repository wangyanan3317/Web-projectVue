import request from './request'

/**
 * 按模块拆分的 API 函数：页面组件只调用这些函数，不直接接触 axios
 * （配合 Mock.js，接口将来换成真实后端时无需改动任何页面代码）
 */

/* ---------- 用户 ---------- */
export const login = (data) => request.post('/user/login', data)
export const register = (data) => request.post('/user/register', data)
export const updateProfile = (data) => request.post('/user/update', data)

/* ---------- 统计 ---------- */
export const getStats = () => request.get('/stats')

/* ---------- 非遗项目 ---------- */
export const getHeritages = (params) => request.get('/heritages', { params })
export const getHeritageDetail = (id) => request.get('/heritages/detail', { params: { id } })
export const getHotHeritages = () => request.get('/heritages/hot')

/* ---------- 传承人 ---------- */
export const getInheritors = () => request.get('/inheritors')

/* ---------- 评论 ---------- */
export const getComments = (heritageId) => request.get('/comments', { params: { heritageId } })
export const addComment = (data) => request.post('/comments', data)
export const getMyComments = (username) => request.get('/comments/mine', { params: { username } })

/* ---------- 收藏 ---------- */
export const getFavorites = (username) => request.get('/favorites', { params: { username } })
export const toggleFavorite = (username, heritageId) =>
  request.post('/favorites/toggle', { username, heritageId })
