import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useInput from './useInput'

describe('useInput', () => {
  it('mengelola nilai, onChange, setValue, dan reset', () => {
    const { result } = renderHook(() => useInput('awal'))
    expect(result.current[0]).toBe('awal')
    act(() => result.current[1]({ target: { value: 'baru' } }))
    expect(result.current[0]).toBe('baru')
    act(() => result.current[2]('manual'))
    expect(result.current[0]).toBe('manual')
    act(() => result.current[3]())
    expect(result.current[0]).toBe('awal')
  })

  it('default string kosong', () => {
    const { result } = renderHook(() => useInput())
    expect(result.current[0]).toBe('')
  })
})
