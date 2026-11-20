import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PublicArticleList from './PublicArticleList'
import { getPublicPosts } from '../api/blogApi'

vi.mock('../api/blogApi', () => ({ getPublicPosts: vi.fn() }))

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
    getPublicPosts.mockResolvedValue([post(), post({ id: 2, slug: 'b', title: 'Berseni', cover_image_path: 'http://img/x.png' })])
    render(<PublicArticleList />)

    expect(screen.getByRole('status')).toHaveTextContent('Memuat artikel...')
    expect(await screen.findByText('Halo Dunia')).toBeInTheDocument()
    expect(document.querySelector('img')).toHaveAttribute('src', 'http://img/x.png')
    expect(screen.getByText('H', { selector: 'div' })).toBeInTheDocument()
    expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: '' })

    await userEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: 'Bisnis' }))
    await userEvent.type(screen.getByLabelText('Cari artikel'), 'g')
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: 'g', category: 'Bisnis' }))

    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    await userEvent.click(await screen.findByRole('link', { name: 'Halo Dunia' }))
    expect(window.location.pathname).toBe('/posts/halo')
    expect(document.title).toMatch(/Delcom Blog/)
  })

  it('menampilkan kondisi kosong', async () => {
    getPublicPosts.mockResolvedValue([])
    render(<PublicArticleList />)
    expect(await screen.findByText('Belum ada artikel yang cocok.')).toBeInTheDocument()
  })

  it('menampilkan pesan error', async () => {
    getPublicPosts.mockRejectedValue(new Error('Server mati'))
    render(<PublicArticleList />)
    expect(await screen.findByText('Server mati')).toBeInTheDocument()
    expect(screen.queryByText('Belum ada artikel yang cocok.')).not.toBeInTheDocument()
  })

  it('mengabaikan hasil permintaan lama (sukses) yang selesai terlambat', async () => {
    const first = deferred()
    getPublicPosts.mockReturnValueOnce(first.promise).mockResolvedValue([post({ title: 'Terbaru' })])
    render(<PublicArticleList />)

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'x')
    expect(await screen.findByText('Terbaru')).toBeInTheDocument()
    await act(async () => first.resolve([post({ title: 'Usang' })]))
    expect(screen.queryByText('Usang')).not.toBeInTheDocument()
  })

  it('mengabaikan error permintaan lama yang selesai terlambat', async () => {
    const first = deferred()
    getPublicPosts.mockReturnValueOnce(first.promise).mockResolvedValue([post({ title: 'Terbaru' })])
    render(<PublicArticleList />)

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'x')
    expect(await screen.findByText('Terbaru')).toBeInTheDocument()
    await act(async () => first.reject(new Error('Usang')))
    expect(screen.queryByText('Usang')).not.toBeInTheDocument()
  })
})
