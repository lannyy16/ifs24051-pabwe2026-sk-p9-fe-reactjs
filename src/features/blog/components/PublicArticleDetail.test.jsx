import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PublicArticleDetail from './PublicArticleDetail'
import { getPublicPost } from '../api/blogApi'

vi.mock('../api/blogApi', () => ({ getPublicPost: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))

const article = (over = {}) => ({
  title: 'Judul', category: 'Opini', content: '# isi', cover_image_path: '', reading_time: 4,
  published_at: '2026-02-03T00:00:00Z', author: { username: 'sari' }, ...over,
})

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

describe('PublicArticleDetail', () => {
  it('memuat artikel tanpa sampul, lalu tombol kembali', async () => {
    getPublicPost.mockResolvedValue(article())
    const navigate = vi.fn()
    render(<PublicArticleDetail slug="judul" navigate={navigate} />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByText('Judul')).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('# isi')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Oleh sari')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Kembali/ }))
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('menampilkan gambar sampul bila ada', async () => {
    getPublicPost.mockResolvedValue(article({ cover_image_path: 'http://img/c.png' }))
    render(<PublicArticleDetail slug="x" navigate={vi.fn()} />)
    expect(await screen.findByAltText('Judul')).toHaveAttribute('src', 'http://img/c.png')
  })

  it('menampilkan error', async () => {
    getPublicPost.mockRejectedValue(new Error('Artikel tidak ditemukan'))
    render(<PublicArticleDetail slug="x" navigate={vi.fn()} />)
    expect(await screen.findByText('Artikel tidak ditemukan')).toBeInTheDocument()
    expect(screen.queryByText('Memuat artikel...')).not.toBeInTheDocument()
  })

  it('mengabaikan hasil setelah unmount (sukses & gagal)', async () => {
    const a = deferred()
    const b = deferred()
    getPublicPost.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise)
    const r1 = render(<PublicArticleDetail slug="a" navigate={vi.fn()} />)
    r1.unmount()
    const r2 = render(<PublicArticleDetail slug="b" navigate={vi.fn()} />)
    r2.unmount()
    await act(async () => { a.resolve(article()); b.reject(new Error('x')) })
    expect(screen.queryByText('Judul')).not.toBeInTheDocument()
  })
})
