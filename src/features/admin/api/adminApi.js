import { apiRequest } from '../../../helpers/apiHelper'

export const getUsers = async () => (await apiRequest('/admin/users')).data
export const getAllPosts = async () => (await apiRequest('/admin/posts')).data
export const getUserPosts = async (id) => (await apiRequest(`/admin/users/${id}/posts`)).data
