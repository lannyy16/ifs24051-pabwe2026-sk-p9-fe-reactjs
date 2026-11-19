import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthorDashboard from './AuthorDashboard'
import { deletePost, getMyPosts, getStats, togglePublish } from '../api/blogApi'
import { confirmDelete, showError, showSuccess } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({
  getMyPosts: vi.fn(), getStats: vi.fn(), togglePublish: vi.fn(), deletePost: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper', () => ({
  confirmDelete: vi.fn(), formatDate: () => '1 Januari 2026', showError: vi.fn(), showSuccess: vi.fn(),
}))
vi.mock('../modals/PostModal', () => ({
  default: ({ open, post, initial, onClose, onSaved }) =>
    open ? (
      <div data-testid="post-modal">
        <span>{post ? `edit:${post.title}` : 'new'}</span>
        <span>{initial ? `initial:${initial.title}` : 'noinitial'}</span>
        <button onClick={onSaved}>saved</button>
        <button onClick={onClose}>close-post</button>
      </div>
    ) : null,
}))
vi.mock('../modals/AiPostGeneratorModal', () => ({
  default: ({ open, onClose, onApply }) =>
    open ? (
      <div data-testid="ai-modal">
        <button onClick={() => onApply({ title: 'Hasil AI' })}>apply</button>
        <button onClick={onClose}>close-ai</button>
      </div>
    ) : null,
}))

const published = { id: 1, slug: 'pub', title: 'Terbit', category: 'Umum', is_published: true, created_at: '2026-01-01' }
const draft = { id: 2, slug: 'drf', title: 'Draf', category: 'Bisnis', is_published: false, created_at: '2026-01-01' }

beforeEach(() => {
  getMyPosts.mockResolvedValue([published, draft])
  getStats.mockResolvedValue({ total: 2, published: 1, draft: 1 })
})

describe('AuthorDashboard', () => {
  it('memuat statistik dan tabel artikel', async () => {
    render(<AuthorDashboard navigate={vi.fn()} />)
    expect(screen.getByText('Memuat...')).toBeInTheDocument()
    expect(await screen.findByText('Terbit')).toBeInTheDocument()
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('2')
    expect(screen.getByRole('switch', { name: 'Status terbit Terbit' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('switch', { name: 'Status terbit Draf' })).toHaveAttribute('aria-checked', 'false')
  })

  it('startCreate langsung membuka form tambah artikel', async () => {
    render(<AuthorDashboard navigate={vi.fn()} startCreate />)
    expect(within(await screen.findByTestId('post-modal')).getByText('new')).toBeInTheDocument()
  })

  it('menampilkan kondisi kosong', async () => {
    getMyPosts.mockResolvedValue([])
    render(<AuthorDashboard navigate={vi.fn()} />)
    expect(await screen.findByText('Belum ada artikel.')).toBeInTheDocument()
  })

  it('menampilkan error saat gagal memuat', async () => {
    getMyPosts.mockRejectedValue(new Error('gagal muat'))
    render(<AuthorDashboard navigate={vi.fn()} />)
    await waitFor(() => expect(showError).toHaveBeenCalledWith('gagal muat'))
  })

  it('toggle status terbit: sukses dan gagal', async () => {
    togglePublish.mockResolvedValueOnce({})
    render(<AuthorDashboard navigate={vi.fn()} />)
    await screen.findByText('Terbit')
    await userEvent.click(screen.getByRole('switch', { name: 'Status terbit Draf' }))
    await waitFor(() => expect(togglePublish).toHaveBeenCalledWith(2))
    await waitFor(() => expect(getMyPosts).toHaveBeenCalledTimes(2))

    togglePublish.mockRejectedValueOnce(new Error('toggle gagal'))
    await userEvent.click(screen.getByRole('switch', { name: 'Status terbit Draf' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('toggle gagal'))
  })

  it('menu kebab: buka/tutup, Edit, dan Lihat hanya untuk artikel terbit', async () => {
    const navigate = vi.fn()
    render(<AuthorDashboard navigate={navigate} />)
    await screen.findByText('Terbit')

    await userEvent.click(screen.getByLabelText('Menu Draf'))
    expect(screen.queryByText('Lihat')).not.toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Menu Draf'))
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByText('Lihat'))
    expect(navigate).toHaveBeenCalledWith('/posts/pub')

    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByText('Edit'))
    expect(within(screen.getByTestId('post-modal')).getByText('edit:Terbit')).toBeInTheDocument()
    await userEvent.click(screen.getByText('close-post'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
  })

  it('hapus artikel: dibatalkan, sukses, dan gagal', async () => {
    render(<AuthorDashboard navigate={vi.fn()} />)
    await screen.findByText('Terbit')

    confirmDelete.mockResolvedValueOnce(false)
    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByText('Hapus'))
    expect(deletePost).not.toHaveBeenCalled()

    confirmDelete.mockResolvedValueOnce(true)
    deletePost.mockResolvedValueOnce({})
    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByText('Hapus'))
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil dihapus'))
    expect(deletePost).toHaveBeenCalledWith(1)

    confirmDelete.mockResolvedValueOnce(true)
    deletePost.mockRejectedValueOnce(new Error('hapus gagal'))
    await userEvent.click(screen.getByLabelText('Menu Terbit'))
    await userEvent.click(screen.getByText('Hapus'))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('hapus gagal'))
  })

  it('Tambah Artikel, AI Generator → terapkan ke editor, dan simpan memuat ulang', async () => {
    render(<AuthorDashboard navigate={vi.fn()} />)
    await screen.findByText('Terbit')

    await userEvent.click(screen.getByRole('button', { name: /Tambah Artikel/ }))
    expect(within(screen.getByTestId('post-modal')).getByText('new')).toBeInTheDocument()
    await userEvent.click(screen.getByText('saved'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
    await waitFor(() => expect(getMyPosts).toHaveBeenCalledTimes(2))

    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByText('close-ai'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByText('apply'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('post-modal')).getByText('initial:Hasil AI')).toBeInTheDocument()
  })
})
