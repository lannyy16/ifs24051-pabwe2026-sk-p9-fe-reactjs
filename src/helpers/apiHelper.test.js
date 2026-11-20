import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, clearSession, getStoredUser, getToken, saveSession } from './apiHelper'

const mockFetch = (body, ok = true, status = 200, jsonFails = false) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: jsonFails ? () => Promise.reject(new Error('x')) : () => Promise.resolve(body),
  })
}

afterEach(() => vi.unstubAllEnvs())

describe('session helpers', () => {
  it('menyimpan, membaca, dan menghapus sesi', () => {
    saveSession('tok', { id: 1 })
    expect(getToken()).toBe('tok')
    expect(getStoredUser()).toEqual({ id: 1 })
    clearSession()
    expect(getToken()).toBeNull()
    expect(getStoredUser()).toBeNull()
  })

  it('mengembalikan null bila user tersimpan rusak', () => {
    localStorage.setItem('user', '{rusak')
    expect(getStoredUser()).toBeNull()
  })
})

describe('apiRequest', () => {
  it('mengirim GET dengan Bearer token dan mengembalikan JSON', async () => {
    saveSession('abc', {})
    mockFetch({ status: 'success', data: [1] })
    const res = await apiRequest('/posts')
    expect(res.data).toEqual([1])
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('/api/posts')
    expect(opts.headers.Authorization).toBe('Bearer abc')
    expect(opts.body).toBeUndefined()
  })

  it('tidak mengirim token bila auth=false atau token kosong, serta mengirim body', async () => {
    mockFetch({ status: 'success' })
    await apiRequest('/auth/login', { method: 'POST', body: { a: 1 }, auth: false })
    let opts = fetch.mock.calls[0][1]
    expect(opts.headers.Authorization).toBeUndefined()
    expect(opts.body).toBe('{"a":1}')

    await apiRequest('/posts') // auth default, tetapi belum ada token
    opts = fetch.mock.calls[1][1]
    expect(opts.headers.Authorization).toBeUndefined()
  })

  it('memakai VITE_API_BASE_URL bila diatur', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    mockFetch({ status: 'success' })
    await apiRequest('/x')
    expect(fetch.mock.calls[0][0]).toBe('https://api.example.com/api/x')
  })

  it('melempar Error dengan pesan & status dari server', async () => {
    mockFetch({ status: 'fail', message: 'Ditolak' }, false, 401)
    await expect(apiRequest('/x')).rejects.toMatchObject({ message: 'Ditolak', status: 401 })
  })

  it('memakai pesan default bila server tidak memberi pesan', async () => {
    mockFetch({ status: 'fail' }, false, 400)
    await expect(apiRequest('/x')).rejects.toThrow('Terjadi kesalahan')
  })

  it('menangani respons non-JSON', async () => {
    mockFetch(null, false, 502, true)
    await expect(apiRequest('/x')).rejects.toThrow('Respons server tidak valid')
  })

  it('menganggap respons 200 dengan status bukan success sebagai gagal', async () => {
    mockFetch({ status: 'error', message: 'Aneh' })
    await expect(apiRequest('/x')).rejects.toThrow('Aneh')
  })
})
