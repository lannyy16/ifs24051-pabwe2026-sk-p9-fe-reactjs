import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import useTheme from './useTheme'

afterEach(() => {
  document.documentElement.classList.remove('dark')
  delete document.documentElement.dataset.accent
})

describe('useTheme', () => {
  it('default light, toggle ke dark & kembali, menyimpan ke localStorage', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
  })

  it('memakai preferensi sistem dark bila belum ada pilihan', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true })
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    spy.mockRestore()
  })

  it('memakai tema & aksen tersimpan, serta dapat mengganti aksen', () => {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('accent', 'rose')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.accent).toBe('rose')
    act(() => result.current.setAccent('emerald'))
    expect(document.documentElement.dataset.accent).toBe('emerald')
  })
})
