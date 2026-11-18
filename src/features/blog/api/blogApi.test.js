import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import * as api from './blogApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn(async () => ({ data: 'D' })) }))

describe('blogApi', () => {
  it('endpoint publik', async () => {
    expect(await api.getCategories()).toBe('D')
    await api.getPublicPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts', { auth: false })
    await api.getPublicPosts({ q: 'go lang', category: 'Bisnis' })
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts?q=go+lang&category=Bisnis', { auth: false })
    await api.getPublicPosts({ q: 'x' })
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts?q=x', { auth: false })
    await api.getPublicPost('a b')
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts/a%20b', { auth: false })
  })

  it('endpoint penulis', async () => {
    expect(await api.getMyPosts()).toBe('D')
    expect(await api.getStats()).toBe('D')
    expect(await api.createPost({ t: 1 })).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/posts', { method: 'POST', body: { t: 1 } })
    expect(await api.updatePost(3, { t: 2 })).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3', { method: 'PUT', body: { t: 2 } })
    expect(await api.togglePublish(3)).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3/toggle-publish', { method: 'PATCH' })
    await api.deletePost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3', { method: 'DELETE' })
    expect(await api.aiGenerate({ topic: 'x' })).toBe('D')
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/ai-generate', { method: 'POST', body: { topic: 'x' } })
    expect(api.CATEGORIES).toHaveLength(6)
  })
})
