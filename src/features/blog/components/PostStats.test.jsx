import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('menampilkan 3 kartu statistik', () => {
    render(<PostStats stats={{ total_articles: 5, total_selesai: 3, belum_selesai: 2 }} />)
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('5')
    expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Belum Selesai (Draf)').nextSibling).toHaveTextContent('2')
  })
})
