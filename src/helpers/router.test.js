import { describe, expect, it, vi } from 'vitest'
import { getRedirect, homeFor, matchRoute, navigate } from './router'

describe('navigate', () => {
  it('pushState lalu memberi tahu App lewat popstate', () => {
    const onPop = vi.fn()
    window.addEventListener('popstate', onPop)
    navigate('/login')
    expect(window.location.pathname).toBe('/login')
    expect(onPop).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    window.removeEventListener('popstate', onPop)
  })

  it('replace mengganti entri riwayat', () => {
    const spy = vi.spyOn(window.history, 'replaceState')
    navigate('/admin', { replace: true })
    expect(spy).toHaveBeenCalled()
    expect(window.location.pathname).toBe('/admin')
    spy.mockRestore()
  })
})

describe('matchRoute', () => {
  it('memetakan seluruh path', () => {
    expect(matchRoute('/')).toEqual({ name: 'home' })
    expect(matchRoute('/public')).toEqual({ name: 'home' })
    expect(matchRoute('/posts')).toEqual({ name: 'home' })
    expect(matchRoute('/posts/')).toEqual({ name: 'home' })
    expect(matchRoute('/posts/create')).toEqual({ name: 'author', create: true })
    expect(matchRoute('/posts/halo%20dunia')).toEqual({ name: 'post', slug: 'halo dunia' })
    expect(matchRoute('/login')).toEqual({ name: 'login' })
    expect(matchRoute('/register')).toEqual({ name: 'register' })
    expect(matchRoute('/dashboard')).toEqual({ name: 'author' })
    expect(matchRoute('/author')).toEqual({ name: 'author' })
    expect(matchRoute('/admin')).toEqual({ name: 'admin' })
    expect(matchRoute('/tidak-ada')).toEqual({ name: 'notfound' })
    expect(matchRoute('/a/b/c')).toEqual({ name: 'notfound' })
  })
})

describe('getRedirect', () => {
  const member = { role: 'member' }
  const admin = { role: 'admin' }
  it('aturan akses per halaman', () => {
    expect(homeFor(admin)).toBe('/admin')
    expect(homeFor(member)).toBe('/dashboard')
    expect(getRedirect('login', null)).toBeNull()
    expect(getRedirect('register', member)).toBe('/dashboard')
    expect(getRedirect('login', admin)).toBe('/admin')
    expect(getRedirect('author', null)).toBe('/login')
    expect(getRedirect('author', member)).toBeNull()
    expect(getRedirect('admin', null)).toBe('/login')
    expect(getRedirect('admin', member)).toBe('/dashboard')
    expect(getRedirect('admin', admin)).toBeNull()
    expect(getRedirect('home', null)).toBeNull()
  })
})
