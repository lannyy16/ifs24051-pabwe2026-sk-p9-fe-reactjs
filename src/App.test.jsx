import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { logout } from './features/auth/api/authApi'

vi.mock('./features/auth/api/authApi', () => ({ logout: vi.fn() }))
vi.mock('./features/blog/components/PublicArticleList', () => ({ default: () => <div>VIEW-LIST</div> }))
vi.mock('./features/blog/components/PublicArticleDetail', () => ({ default: ({ slug }) => <div>VIEW-DETAIL:{slug}</div> }))
vi.mock('./features/blog/components/AuthorDashboard', () => ({
  default: ({ startCreate }) => <div>VIEW-AUTHOR{startCreate ? ':create' : ''}</div>,
}))
vi.mock('./features/admin/components/AdminDashboard', () => ({ default: () => <div>VIEW-ADMIN</div> }))
vi.mock('./features/auth/components/AuthPage', () => ({
  default: ({ mode, onAuthSuccess }) => (
    <div>
      VIEW-{mode.toUpperCase()}
      <button onClick={() => onAuthSuccess({ token: 't1', user: { id: 1, role: 'member' } })}>auth-member</button>
      <button onClick={() => onAuthSuccess({ token: 't2', user: { id: 2, role: 'admin' } })}>auth-admin</button>
    </div>
  ),
}))
vi.mock('./features/auth/modals/AuthModal', () => ({
  default: ({ open, onClose, onAuthSuccess }) =>
    open ? (
      <div>
        MODAL-LOGIN
        <button onClick={() => onAuthSuccess({ token: 't', user: { id: 1, role: 'member' } })}>modal-auth</button>
        <button onClick={onClose}>modal-close</button>
      </div>
    ) : null,
}))
vi.mock('./features/blog/components/StickyNavbar', () => ({
  default: ({ user, onLogout, onOpenLogin, onToggleTheme, onAccent }) => (
    <nav>
      <span>user:{user ? user.role : 'guest'}</span>
      <button onClick={onOpenLogin}>open-login</button>
      <button onClick={onLogout}>logout</button>
      <button onClick={onToggleTheme}>theme</button>
      <button onClick={() => onAccent('rose')}>accent</button>
    </nav>
  ),
}))

const member = { id: 1, role: 'member', username: 'm' }
const admin = { id: 2, role: 'admin', username: 'a' }
const session = (user) => {
  localStorage.setItem('token', 'tok')
  localStorage.setItem('user', JSON.stringify(user))
}
const go = (path) =>
  act(() => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  })

beforeEach(() => {
  logout.mockResolvedValue({})
})

describe('App', () => {
  it('menampilkan fallback saat memuat halaman lazy (pemuatan pertama)', async () => {
    session(member)
    window.history.pushState({}, '', '/dashboard')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Memuat halaman...' })).toBeInTheDocument()
    expect(await screen.findByText('VIEW-AUTHOR')).toBeInTheDocument()
  })

  it('menampilkan beranda, footer, dan mengikuti popstate (detail, 404)', async () => {
    render(<App />)
    expect(screen.getByText('VIEW-LIST')).toBeInTheDocument()
    expect(screen.getByText('user:guest')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()

    go('/posts/abc%20d')
    expect(screen.getByText('VIEW-DETAIL:abc d')).toBeInTheDocument()

    go('/tidak-ada')
    expect(screen.getByRole('heading', { level: 1, name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
    expect(document.title).toMatch(/tidak ditemukan/)
    await userEvent.click(screen.getByRole('link', { name: 'Kembali ke beranda' }))
    expect(screen.getByText('VIEW-LIST')).toBeInTheDocument()
  })

  it('merender langsung dari URL awal (refresh tetap di rute yang sama)', () => {
    window.history.pushState({}, '', '/register')
    render(<App />)
    expect(screen.getByText('VIEW-REGISTER')).toBeInTheDocument()
  })

  it('mengalihkan tamu dari /dashboard dan /admin ke /login (replaceState)', async () => {
    window.history.pushState({}, '', '/dashboard')
    render(<App />)
    expect(await screen.findByText('VIEW-LOGIN')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')

    go('/admin')
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('member tidak boleh /admin; pengguna login dialihkan dari /login dan /register', async () => {
    session(member)
    window.history.pushState({}, '', '/admin')
    render(<App />)
    expect(await screen.findByText('VIEW-AUTHOR')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/dashboard')

    go('/register')
    await waitFor(() => expect(window.location.pathname).toBe('/dashboard'))
  })

  it('/author tetap berfungsi sebagai alias dan /posts/create membuka form tambah', async () => {
    session(member)
    window.history.pushState({}, '', '/author')
    render(<App />)
    expect(await screen.findByText('VIEW-AUTHOR')).toBeInTheDocument()

    go('/posts/create')
    expect(await screen.findByText('VIEW-AUTHOR:create')).toBeInTheDocument()

    go('/posts')
    expect(screen.getByText('VIEW-LIST')).toBeInTheDocument()
  })

  it('admin dapat membuka /admin', async () => {
    session(admin)
    window.history.pushState({}, '', '/admin')
    render(<App />)
    expect(await screen.findByText('VIEW-ADMIN')).toBeInTheDocument()
    expect(screen.getByText('user:admin')).toBeInTheDocument()
  })

  it('login berhasil: member → /dashboard, admin → /admin, tersimpan di localStorage', async () => {
    window.history.pushState({}, '', '/login')
    const { unmount } = render(<App />)
    await userEvent.click(screen.getByText('auth-member'))
    expect(await screen.findByText('VIEW-AUTHOR')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBe('t1')
    expect(window.location.pathname).toBe('/dashboard')
    unmount()

    localStorage.clear()
    window.history.pushState({}, '', '/login')
    render(<App />)
    await userEvent.click(screen.getByText('auth-admin'))
    expect(await screen.findByText('VIEW-ADMIN')).toBeInTheDocument()
  })

  it('login lewat modal navbar: buka, tutup, lalu masuk', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('open-login'))
    expect(screen.getByText('MODAL-LOGIN')).toBeInTheDocument()
    await userEvent.click(screen.getByText('modal-close'))
    expect(screen.queryByText('MODAL-LOGIN')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('open-login'))
    await userEvent.click(screen.getByText('modal-auth'))
    expect(screen.queryByText('MODAL-LOGIN')).not.toBeInTheDocument()
    expect(await screen.findByText('VIEW-AUTHOR')).toBeInTheDocument()
  })

  it('logout membersihkan sesi, juga ketika API logout gagal', async () => {
    session(member)
    const first = render(<App />)
    await userEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(screen.getByText('user:guest')).toBeInTheDocument())
    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByText('VIEW-LIST')).toBeInTheDocument()
    first.unmount()

    session(member)
    logout.mockRejectedValueOnce(new Error('offline'))
    render(<App />)
    await userEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
  })

  it('tombol tema dan aksen tersambung ke useTheme', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('theme'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await userEvent.click(screen.getByText('accent'))
    expect(document.documentElement.dataset.accent).toBe('rose')
    document.documentElement.classList.remove('dark')
  })

})
