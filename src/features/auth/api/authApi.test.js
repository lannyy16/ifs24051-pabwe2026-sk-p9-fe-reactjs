import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { getProfile, login, logout, register, updateProfile } from './authApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn(async () => ({ data: 'D' })) }))

describe('authApi', () => {
  it('memanggil endpoint yang tepat', async () => {
    expect(await login('u', 'p')).toBe('D')
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: { username: 'u', password: 'p' }, auth: false })
    expect(await register({ a: 1 })).toBe('D')
    expect(apiRequest).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: { a: 1 }, auth: false })
    await logout()
    expect(apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
    expect(await getProfile()).toBe('D')
    expect(await updateProfile({ b: 2 })).toBe('D')
    expect(apiRequest).toHaveBeenCalledWith('/auth/profile', { method: 'PUT', body: { b: 2 } })
  })
})
