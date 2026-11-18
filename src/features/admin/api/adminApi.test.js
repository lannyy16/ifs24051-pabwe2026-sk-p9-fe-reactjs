import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { getAllPosts, getUserPosts, getUsers } from './adminApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn(async () => ({ data: 'D' })) }))

describe('adminApi', () => {
  it('memanggil endpoint admin', async () => {
    expect(await getUsers()).toBe('D')
    expect(await getAllPosts()).toBe('D')
    expect(await getUserPosts(4)).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/admin/users/4/posts')
  })
})
