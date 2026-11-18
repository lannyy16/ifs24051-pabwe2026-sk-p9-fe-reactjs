import { useCallback, useEffect, useState } from 'react'
import useTheme from './hooks/useTheme'
import { clearSession, getStoredUser, saveSession } from './helpers/apiHelper'
import { logout } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import AdminDashboard from './features/admin/components/AdminDashboard'

/** Menentukan tampilan (atau redirect) berdasarkan path URL dan sesi pengguna. */
export function resolveRoute(path, user) {
  if (path === '/' || path === '/public') return { name: 'list' }
  const detail = path.match(/^\/posts\/([^/]+)$/)
  if (detail) return { name: 'detail', slug: decodeURIComponent(detail[1]) }
  if (path === '/login' || path === '/register') {
    return user ? { redirect: '/author' } : { name: path.slice(1) }
  }
  if (path === '/author') return user ? { name: 'author' } : { redirect: '/login' }
  if (path === '/admin') {
    if (!user) return { redirect: '/login' }
    return user.role === 'admin' ? { name: 'admin' } : { redirect: '/author' }
  }
  return { name: 'notfound' }
}

export default function App() {
  const { theme, toggleTheme, accent, setAccent } = useTheme()
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(getStoredUser)
  const [loginOpen, setLoginOpen] = useState(false)

  const route = resolveRoute(path, user)

  const navigate = useCallback((to, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState'](null, '', to)
    setPath(to)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (route.redirect) navigate(route.redirect, true)
  }, [route.redirect, navigate])

  const onAuthSuccess = ({ token, user: u }) => {
    saveSession(token, u)
    setUser(u)
    setLoginOpen(false)
    navigate(u.role === 'admin' ? '/admin' : '/author')
  }

  const onLogout = async () => {
    await logout().catch(() => {})
    clearSession()
    setUser(null)
    navigate('/')
  }

  const view = () => {
    switch (route.name) {
      case 'list': return <PublicArticleList navigate={navigate} />
      case 'detail': return <PublicArticleDetail slug={route.slug} navigate={navigate} />
      case 'login':
      case 'register': return <AuthPage mode={route.name} onAuthSuccess={onAuthSuccess} navigate={navigate} />
      case 'author': return <AuthorDashboard navigate={navigate} />
      case 'admin': return <AdminDashboard />
      case 'notfound':
        return (
          <main className="py-20 text-center">
            <h1 className="text-3xl font-bold">404</h1>
            <p className="mt-2 text-slate-500">Halaman tidak ditemukan.</p>
            <button type="button" className="btn-primary mt-4" onClick={() => navigate('/')}>Ke Beranda</button>
          </main>
        )
      default: return null
    }
  }

  return (
    <>
      <StickyNavbar
        user={user} theme={theme} onToggleTheme={toggleTheme} accent={accent} onAccent={setAccent}
        navigate={navigate} onLogout={onLogout} onOpenLogin={() => setLoginOpen(true)}
      />
      {view()}
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} onAuthSuccess={onAuthSuccess} navigate={navigate} />
    </>
  )
}
