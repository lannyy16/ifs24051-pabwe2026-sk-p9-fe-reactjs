import { apiRequest } from '../../../helpers/apiHelper'

export const getCategories = async () => (await apiRequest('/public/categories', { auth: false })).data

export const getPublicPosts = async ({ q = '', category = '' } = {}) => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const qs = params.toString()
  return (await apiRequest(`/public/posts${qs ? `?${qs}` : ''}`, { auth: false })).data
}

export const getPublicPost = async (slug) =>
  (await apiRequest(`/public/posts/${encodeURIComponent(slug)}`, { auth: false })).data

export const getMyPosts = async () => (await apiRequest('/posts')).data
export const getStats = async () => (await apiRequest('/posts/stats')).data
export const createPost = async (payload) => (await apiRequest('/posts', { method: 'POST', body: payload })).data
export const updatePost = async (id, payload) =>
  (await apiRequest(`/posts/${id}`, { method: 'PUT', body: payload })).data
export const togglePublish = async (id) =>
  (await apiRequest(`/posts/${id}/toggle-publish`, { method: 'PATCH' })).data
export const deletePost = async (id) => apiRequest(`/posts/${id}`, { method: 'DELETE' })
export const aiGenerate = async (payload) =>
  (await apiRequest('/posts/ai-generate', { method: 'POST', body: payload })).data

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']
