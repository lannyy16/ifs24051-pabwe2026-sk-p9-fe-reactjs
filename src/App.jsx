import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import useTheme from './hooks/useTheme'
import { clearSession, getStoredUser, saveSession } from './helpers/apiHelper'
import { getRedirect, homeFor, matchRoute, navigate } from './helpers/router'
import { logout } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import Link from './components/Link'
import usePageMeta from './hooks/usePageMeta'

const AuthorDashboard = lazy(() => import('./features/blog/components/AuthorDashboard'))
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard'))

function NotFound() {
  usePageMeta('Halaman tidak ditemukan - Delcom Blog', 'Halaman yang Anda cari tidak ditemukan di Delcom Blog.')
  return (
    <main className="grid min-h-[50vh] place-items-center px-4 py-20 text-center">
      <div>
        <p className="m-0 text-7xl font-black text-accent-ink" aria-hidden="true">404</p>
        <h1 className="m-0 mt-2 text-3xl font-extrabold">Halaman tidak ditemukan</h1>
        <p className="mb-6 mt-2 muted">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
        <Link to="/" className="btn-primary">Kembali ke beranda</Link>
      </div>
    </main>
  )
}

function Loading({ text }) {
  return (
    <main className="grid min-h-[50vh] place-items-center px-4 py-20 text-center">
      <h1 className="m-0 text-2xl font-bold">{text}</h1>
    </main>
  )
}

export default function App() {
  const { theme, toggleTheme, accent, setAccent } = useTheme()
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(getStoredUser)
  const [loginOpen, setLoginOpen] = useState(false)

  const route = matchRoute(path)
  const redirect = getRedirect(route.name, user)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect])

  const onAuthSuccess = useCallback(({ token, user: u }) => {
    saveSession(token, u)
    setUser(u)
    setLoginOpen(false)
    navigate(homeFor(u))
  }, [])

  const onLogout = async () => {
    await logout().catch(() => {})
    clearSession()
    setUser(null)
    navigate('/')
  }

  const view = () => {
    if (redirect) return <Loading text="Mengalihkan..." />
    switch (route.name) {
      case 'home': return <PublicArticleList />
      case 'post': return <PublicArticleDetail slug={route.slug} />
      case 'login':
      case 'register': return <AuthPage mode={route.name} onAuthSuccess={onAuthSuccess} />
      case 'author': return <AuthorDashboard key={path} startCreate={Boolean(route.create)} />
      case 'admin': return <AdminDashboard />
      default: return <NotFound />
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StickyNavbar
        user={user} theme={theme} onToggleTheme={toggleTheme} accent={accent} onAccent={setAccent}
        onLogout={onLogout} onOpenLogin={() => setLoginOpen(true)}
      />
      <div className="flex-1">
        <Suspense fallback={<Loading text="Memuat halaman..." />}>{view()}</Suspense>
      </div>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm muted dark:border-slate-700/70 dark:bg-slate-900">
        <p className="m-0">&copy; 2026 Delcom Blog. Dibuat dengan React, Gin, dan AI.</p>
      </footer>
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} onAuthSuccess={onAuthSuccess} />
    </div>
  )
}
