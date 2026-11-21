import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { fetchPublicPosts } from '../api/blogApi'
import PublicArticleList from './PublicArticleList'

vi.mock('../api/blogApi', () => ({ fetchPublicPosts: vi.fn() }))

const posts = [
  {
    id: 1,
    slug: 'belajar-go',
    title: 'Belajar Go',
    category: 'Teknologi',
    excerpt: 'Ringkasan Go',
    author_name: 'andi',
    published_at: '2026-11-10T12:00:00Z',
    reading_time: 3,
  },
]

describe('PublicArticleList', () => {
  it('menampilkan status memuat lalu daftar artikel', async () => {
    let resolve
    fetchPublicPosts.mockReturnValueOnce(new Promise((r) => (resolve = r)))
    render(<PublicArticleList />)
    expect(screen.getByRole('status')).toHaveTextContent('Memuat artikel')
    await act(async () => resolve(posts))
    expect(await screen.findByRole('heading', { level: 2, name: 'Belajar Go' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Belajar Go' })).toHaveAttribute('href', '/posts/belajar-go')
    expect(screen.getByText(/3 menit baca/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Delcom Blog' })).toBeInTheDocument()
    expect(document.title).toContain('Delcom Blog')
  })

  it('membatasi 9 artikel per halaman dan memuat lebih banyak', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ ...posts[0], id: i + 1, slug: `a-${i}`, title: `Artikel ${i + 1}` }))
    fetchPublicPosts.mockResolvedValueOnce(many)
    render(<PublicArticleList />)
    expect(await screen.findByRole('heading', { level: 2, name: 'Artikel 1' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(9)
    await userEvent.click(screen.getByRole('button', { name: 'Muat lebih banyak' }))
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(12)
    expect(screen.queryByRole('button', { name: 'Muat lebih banyak' })).not.toBeInTheDocument()
  })

  it('menampilkan pesan kosong', async () => {
    fetchPublicPosts.mockResolvedValueOnce([])
    render(<PublicArticleList />)
    expect(await screen.findByText('Belum ada artikel yang cocok.')).toBeInTheDocument()
  })

  it('menampilkan pesan error', async () => {
    fetchPublicPosts.mockRejectedValueOnce(new Error('Server mati'))
    render(<PublicArticleList />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Server mati')
  })

  it('mencari dengan kata kunci dan memfilter kategori', async () => {
    fetchPublicPosts.mockResolvedValue(posts)
    render(<PublicArticleList />)
    await screen.findByText('Belajar Go')

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'go')
    expect(fetchPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' })

    await userEvent.click(screen.getByRole('button', { name: 'Teknologi' }))
    expect(screen.getByRole('button', { name: 'Teknologi' })).toHaveAttribute('aria-pressed', 'true')
    expect(fetchPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Teknologi' })

    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    expect(fetchPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' })
  })

  it('mengabaikan hasil yang datang setelah unmount', async () => {
    let resolve
    fetchPublicPosts.mockReturnValueOnce(new Promise((r) => (resolve = r)))
    const { unmount } = render(<PublicArticleList />)
    unmount()
    await act(async () => resolve(posts))
    expect(fetchPublicPosts).toHaveBeenCalledTimes(1)
  })
})
