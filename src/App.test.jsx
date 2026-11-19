import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { resolveRoute } from './App'
import { logout } from './features/auth/api/authApi'

vi.mock('./features/auth/api/authApi', () => ({ logout: vi.fn() }))
vi.mock('./features/blog/components/PublicArticleList', () => ({ default: () => <div>VIEW-LIST</div> }))
vi.mock('./features/blog/components/PublicArticleDetail', () => ({ default: ({ slug }) => <div>VIEW-DETAIL:{slug}</div> }))
vi.mock('./features/blog/components/AuthorDashboard', () => ({ default: ({ startCreate }) => <div>VIEW-AUTHOR{startCreate ? ':create' : ''}</div> }))
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
  default: ({ user, navigate, onLogout, onOpenLogin, onToggleTheme, onAccent }) => (
    <nav>
      <span>user:{user ? user.role : 'guest'}</span>
      <button onClick={() => navigate('/posts/abc%20d')}>go-detail</button>
      <button onClick={() => navigate('/dashboard')}>go-author</button>
      <button onClick={() => navigate('/admin')}>go-admin</button>
      <button onClick={() => navigate('/xyz')}>go-unknown</button>
      <button onClick={() => navigate('/register')}>go-register</button>
      <button onClick={() => navigate('/')}>go-home</button>
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

beforeEach(() => {
  window.history.pushState({}, '', '/')
  logout.mockResolvedValue({})
})

describe('resolveRoute', () => {
  it('memetakan seluruh path', () => {
    expect(resolveRoute('/', null)).toEqual({ name: 'list' })
    expect(resolveRoute('/public', null)).toEqual({ name: 'list' })
    expect(resolveRoute('/posts', null)).toEqual({ name: 'list' })
    expect(resolveRoute('/posts/create', null)).toEqual({ redirect: '/login' })
    expect(resolveRoute('/posts/create', member)).toEqual({ name: 'author', create: true })
    expect(resolveRoute('/posts/a%20b', null)).toEqual({ name: 'detail', slug: 'a b' })
    expect(resolveRoute('/login', null)).toEqual({ name: 'login' })
    expect(resolveRoute('/register', null)).toEqual({ name: 'register' })
    expect(resolveRoute('/login', member)).toEqual({ redirect: '/dashboard' })
    expect(resolveRoute('/dashboard', null)).toEqual({ redirect: '/login' })
    expect(resolveRoute('/dashboard', member)).toEqual({ name: 'author' })
    expect(resolveRoute('/admin', null)).toEqual({ redirect: '/login' })
    expect(resolveRoute('/admin', member)).toEqual({ redirect: '/dashboard' })
    expect(resolveRoute('/admin', admin)).toEqual({ name: 'admin' })
    expect(resolveRoute('/tidak-ada', null)).toEqual({ name: 'notfound' })
  })
})

describe('App', () => {
  it('menampilkan beranda publik dan navigasi SPA (pushState)', async () => {
    render(<App />)
    expect(screen.getByText('VIEW-LIST')).toBeInTheDocument()
    expect(screen.getByText('user:guest')).toBeInTheDocument()

    await userEvent.click(screen.getByText('go-detail'))
    expect(screen.getByText('VIEW-DETAIL:abc d')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/abc%20d')
    expect(window.scrollTo).toHaveBeenCalled()

    await userEvent.click(screen.getByText('go-unknown'))
    expect(screen.getByText('404')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Ke Beranda'))
    expect(screen.getByText('VIEW-LIST')).toBeInTheDocument()
  })

  it('mengikuti tombol back/forward (popstate)', () => {
    render(<App />)
    act(() => {
      window.history.pushState({}, '', '/login')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByText('VIEW-LOGIN')).toBeInTheDocument()
  })

  it('merender langsung dari URL awal (refresh tetap di rute yang sama)', () => {
    window.history.pushState({}, '', '/register')
    render(<App />)
    expect(screen.getByText('VIEW-REGISTER')).toBeInTheDocument()
  })

  it('mengalihkan tamu dari /author dan /admin ke /login (replaceState)', async () => {
    window.history.pushState({}, '', '/dashboard')
    render(<App />)
    await waitFor(() => expect(screen.getByText('VIEW-LOGIN')).toBeInTheDocument())
    expect(window.location.pathname).toBe('/login')

    await userEvent.click(screen.getByText('go-admin'))
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('member tidak boleh /admin; pengguna login dialihkan dari /login dan /register', async () => {
    session(member)
    window.history.pushState({}, '', '/admin')
    render(<App />)
    expect(await screen.findByText('VIEW-AUTHOR')).toBeInTheDocument()

    await userEvent.click(screen.getByText('go-register'))
    await waitFor(() => expect(window.location.pathname).toBe('/dashboard'))
  })

  it('/posts/create membuka dashboard dengan form tambah, /posts menampilkan daftar', async () => {
    session(member)
    window.history.pushState({}, '', '/posts/create')
    render(<App />)
    expect(await screen.findByText('VIEW-AUTHOR:create')).toBeInTheDocument()
    act(() => {
      window.history.pushState({}, '', '/posts')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByText('VIEW-LIST')).toBeInTheDocument()
  })

  it('admin dapat membuka /admin', async () => {
    session(admin)
    window.history.pushState({}, '', '/admin')
    render(<App />)
    expect(await screen.findByText('VIEW-ADMIN')).toBeInTheDocument()
    expect(screen.getByText('user:admin')).toBeInTheDocument()
  })

  it('login berhasil: member → /author, admin → /admin, tersimpan di localStorage', async () => {
    window.history.pushState({}, '', '/login')
    const { unmount } = render(<App />)
    await userEvent.click(screen.getByText('auth-member'))
    expect(await screen.findByText('VIEW-AUTHOR')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBe('t1')
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
    render(<App />)
    await userEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(screen.getByText('user:guest')).toBeInTheDocument())
    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByText('VIEW-LIST')).toBeInTheDocument()

    session(member)
    logout.mockRejectedValueOnce(new Error('offline'))
    const { unmount } = render(<App />)
    await userEvent.click(screen.getAllByText('logout')[1])
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
    unmount()
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
