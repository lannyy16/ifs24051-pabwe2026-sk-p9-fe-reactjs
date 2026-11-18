import { apiRequest } from '../../../helpers/apiHelper'

export const login = async (username, password) =>
  (await apiRequest('/auth/login', { method: 'POST', body: { username, password }, auth: false })).data

export const register = async (payload) =>
  (await apiRequest('/auth/register', { method: 'POST', body: payload, auth: false })).data

export const logout = async () => apiRequest('/auth/logout', { method: 'POST' })

export const getProfile = async () => (await apiRequest('/auth/profile')).data

export const updateProfile = async (payload) =>
  (await apiRequest('/auth/profile', { method: 'PUT', body: payload })).data
