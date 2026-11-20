import { IconFeather, IconMoon, IconSun } from '@tabler/icons-react'
import Link from '../../../components/Link'
import { ACCENTS } from '../../../hooks/useTheme'

const SWATCH = { indigo: '#4f46e5', emerald: '#047857', rose: '#be123c', amber: '#b45309' }
const linkClass =
  'rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer'

/** Navbar atas sticky (tanpa sidebar) untuk seluruh halaman. */
export default function StickyNavbar({ user, theme, onToggleTheme, accent, onAccent, onLogout, onOpenLogin }) {
  const isDark = theme === 'dark'
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/85">
      <nav aria-label="Navigasi utama" className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="hero-bg grid h-9 w-9 place-items-center rounded-xl text-white" aria-hidden="true">
            <IconFeather size={20} />
          </span>
          Delcom Blog
        </Link>

        <ul className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
          <li>
            <Link to="/" className={linkClass}>Beranda</Link>
          </li>
          {user ? (
            <>
              <li><Link to="/dashboard" className={linkClass}>Workspace</Link></li>
              {user.role === 'admin' && <li><Link to="/admin" className={linkClass}>Admin</Link></li>}
              <li><button type="button" onClick={onLogout} className={linkClass}>Keluar</button></li>
            </>
          ) : (
            <>
              <li><button type="button" onClick={onOpenLogin} className={linkClass}>Masuk</button></li>
              <li>
                <Link to="/register" className="btn-primary">Daftar</Link>
              </li>
            </>
          )}
          <li className="ml-1 hidden items-center gap-1.5 sm:flex" role="group" aria-label="Aksen warna">
            {ACCENTS.map((a) => (
              <button
                key={a}
                type="button"
                aria-label={`Aksen ${a}`}
                aria-pressed={a === accent}
                onClick={() => onAccent(a)}
                className={`h-6 w-6 rounded-full border-2 cursor-pointer ${a === accent ? 'border-slate-900 dark:border-white' : 'border-transparent'}`}
                style={{ background: SWATCH[a] }}
              />
            ))}
          </li>
          <li>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isDark ? <IconSun size={20} aria-hidden="true" /> : <IconMoon size={20} aria-hidden="true" />}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
