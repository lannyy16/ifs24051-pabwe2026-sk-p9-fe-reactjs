import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminDashboard from './AdminDashboard'
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi'
import { showError } from '../../../helpers/toolsHelper'

vi.mock('../api/adminApi', () => ({ getUsers: vi.fn(), getAllPosts: vi.fn(), getUserPosts: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ formatDate: () => '1 Januari 2026', showError: vi.fn() }))

const users = [
  { id: 1, username: 'admin', email: 'a@x.id', role: 'admin', total_posts: 0, total_published: 0 },
  { id: 2, username: 'member', email: 'm@x.id', role: 'member', total_posts: 3, total_published: 2 },
]
const allPosts = [
  { id: 1, title: 'Artikel A', author: { username: 'member' }, category: 'Umum', is_published: true, created_at: 'x' },
  { id: 2, title: 'Artikel B', author: { username: 'member' }, category: 'Bisnis', is_published: false, created_at: 'x' },
]

beforeEach(() => {
  getUsers.mockResolvedValue(users)
  getAllPosts.mockResolvedValue(allPosts)
})

describe('AdminDashboard', () => {
  it('menampilkan ringkasan, direktori pengguna, dan seluruh artikel', async () => {
    render(<AdminDashboard />)
    expect(await screen.findByText('Artikel A')).toBeInTheDocument()
    expect(screen.getByText('Total Pengguna').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Seluruh Artikel')).toBeInTheDocument()
    expect(screen.getByText('Terbit', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Draf')).toBeInTheDocument()
  })

  it('melihat artikel pengguna tertentu lalu kembali ke semua', async () => {
    getUserPosts.mockResolvedValue([allPosts[0]])
    render(<AdminDashboard />)
    await screen.findByText('Artikel A')

    await userEvent.click(screen.getAllByRole('button', { name: 'Lihat Artikel' })[1])
    expect(await screen.findByText('Artikel milik member')).toBeInTheDocument()
    expect(getUserPosts).toHaveBeenCalledWith(2)
    expect(screen.queryByText('Artikel B')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan Semua' }))
    expect(await screen.findByText('Artikel B')).toBeInTheDocument()
    expect(screen.getByText('Seluruh Artikel')).toBeInTheDocument()
  })

  it('menampilkan kondisi kosong', async () => {
    getUsers.mockResolvedValue([])
    getAllPosts.mockResolvedValue([])
    render(<AdminDashboard />)
    expect(await screen.findByText('Tidak ada artikel.')).toBeInTheDocument()
  })

  it('menampilkan error saat memuat & saat membuka artikel pengguna', async () => {
    getUsers.mockRejectedValueOnce(new Error('muat gagal'))
    render(<AdminDashboard />)
    await waitFor(() => expect(showError).toHaveBeenCalledWith('muat gagal'))
  })

  it('error saat memuat artikel pengguna', async () => {
    getUserPosts.mockRejectedValueOnce(new Error('user gagal'))
    render(<AdminDashboard />)
    await screen.findByText('Artikel A')
    await userEvent.click(screen.getAllByRole('button', { name: 'Lihat Artikel' })[0])
    await waitFor(() => expect(showError).toHaveBeenCalledWith('user gagal'))
    expect(screen.getByText('Seluruh Artikel')).toBeInTheDocument()
  })
})
