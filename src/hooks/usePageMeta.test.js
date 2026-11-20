import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import usePageMeta from './usePageMeta'

describe('usePageMeta', () => {
  it('membuat meta description bila belum ada lalu memperbaruinya', () => {
    document.head.querySelectorAll('meta[name="description"]').forEach((m) => m.remove())
    const { rerender } = renderHook(({ t, d }) => usePageMeta(t, d), { initialProps: { t: 'Judul A', d: 'Deskripsi A' } })
    expect(document.title).toBe('Judul A')
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Deskripsi A')

    rerender({ t: 'Judul B', d: 'Deskripsi B' })
    expect(document.title).toBe('Judul B')
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Deskripsi B')
  })
})
