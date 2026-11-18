import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PublicArticleList from './PublicArticleList'
import { getCategories, getPublicPosts } from '../api/blogApi'

vi.mock('../api/blogApi', () => ({ getCategories: vi.fn(), getPublicPosts: vi.fn() }))

const post = (over = {}) => ({
  id: 1, slug: 'halo', title: 'Halo Dunia', excerpt: 'ringkas', category: 'Teknologi',
  cover_image_path: '', reading_time: 3, published_at: '2026-01-02T00:00:00Z', author: { username: 'budi' }, ...over,
})

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

describe('PublicArticleList', () => {
  it('memuat kategori & artikel, filter pill, pencarian, dan navigasi', async () => {
    getCategories.mockResolvedValue(['Teknologi', 'Bisnis'])
    getPublicPosts.mockResolvedValue([post(), post({ id: 2, slug: 'b', title: 'Berseni', cover_image_path: 'http://img/x.png' })])
    const navigate = vi.fn()
    render(<PublicArticleList navigate={navigate} />)

    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByText('Halo Dunia')).toBeInTheDocument()
    expect(screen.getByAltText('Berseni')).toHaveAttribute('src', 'http://img/x.png')
    expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: '' })

    await userEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: 'Bisnis' }))
    await userEvent.type(screen.getByLabelText('Cari artikel'), 'g')
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: 'g', category: 'Bisnis' }))

    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    await userEvent.click(await screen.findByText('Halo Dunia'))
    expect(navigate).toHaveBeenCalledWith('/posts/halo')
  })

  it('menampilkan kondisi kosong dan tetap jalan saat kategori gagal', async () => {
    getCategories.mockRejectedValue(new Error('x'))
    getPublicPosts.mockResolvedValue([])
    render(<PublicArticleList navigate={vi.fn()} />)
    expect(await screen.findByText('Belum ada artikel.')).toBeInTheDocument()
  })

  it('menampilkan pesan error', async () => {
    getCategories.mockResolvedValue([])
    getPublicPosts.mockRejectedValue(new Error('Server mati'))
    render(<PublicArticleList navigate={vi.fn()} />)
    expect(await screen.findByText('Server mati')).toBeInTheDocument()
    expect(screen.queryByText('Belum ada artikel.')).not.toBeInTheDocument()
  })

  it('mengabaikan hasil permintaan lama (sukses) yang selesai terlambat', async () => {
    getCategories.mockResolvedValue([])
    const first = deferred()
    getPublicPosts.mockReturnValueOnce(first.promise).mockResolvedValue([post({ title: 'Terbaru' })])
    render(<PublicArticleList navigate={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'x')
    expect(await screen.findByText('Terbaru')).toBeInTheDocument()
    await act(async () => first.resolve([post({ title: 'Usang' })]))
    expect(screen.queryByText('Usang')).not.toBeInTheDocument()
  })

  it('mengabaikan error permintaan lama yang selesai terlambat', async () => {
    getCategories.mockResolvedValue([])
    const first = deferred()
    getPublicPosts.mockReturnValueOnce(first.promise).mockResolvedValue([post({ title: 'Terbaru' })])
    render(<PublicArticleList navigate={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'x')
    expect(await screen.findByText('Terbaru')).toBeInTheDocument()
    await act(async () => first.reject(new Error('Usang')))
    expect(screen.queryByText('Usang')).not.toBeInTheDocument()
  })
})
