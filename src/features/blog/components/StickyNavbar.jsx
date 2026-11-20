import { IconMoon, IconSun, IconPencil } from '@tabler/icons-react'
import { ACCENTS } from '../../../hooks/useTheme'

/** Navbar atas sticky (tanpa sidebar) untuk seluruh halaman. */
export default function StickyNavbar({ user, theme, onToggleTheme, accent, onAccent, navigate, onLogout, onOpenLogin }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <nav className="mx-auto flex h-16 w-full max-w-[96vw] items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 text-lg font-bold cursor-pointer">
          <IconPencil className="text-accent" /> Delcom Blog
        </button>
        <div className="flex items-center gap-2">
          <div className="hidden gap-1 sm:flex" role="group" aria-label="Aksen warna">
            {ACCENTS.map((a) => (
              <button key={a} type="button" aria-label={`Aksen ${a}`} onClick={() => onAccent(a)}
                className={`h-6 w-6 rounded-full border-2 cursor-pointer ${a === accent ? 'border-slate-700 dark:border-white' : 'border-transparent'}`}
                style={{ background: { indigo: '#4f46e5', emerald: '#047857', rose: '#be123c', amber: '#b45309' }[a] }} />
            ))}
          </div>
          <button type="button" aria-label="Ganti tema" onClick={onToggleTheme} className="btn-ghost px-2.5">
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
          {user ? (
            <>
              <button type="button" className="btn-ghost" onClick={() => navigate('/author')}>Workspace</button>
              {user.role === 'admin' && (
                <button type="button" className="btn-ghost" onClick={() => navigate('/admin')}>Admin</button>
              )}
              <button type="button" className="btn-primary" onClick={onLogout}>Keluar</button>
            </>
          ) : (
            <>
              <button type="button" className="btn-ghost" onClick={onOpenLogin}>Masuk</button>
              <button type="button" className="btn-primary" onClick={() => navigate('/register')}>Daftar</button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
