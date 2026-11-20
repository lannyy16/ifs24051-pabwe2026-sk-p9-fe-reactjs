import { useState } from 'react'
import { IconBrain, IconEdit, IconFeather, IconMail, IconSearch, IconLock, IconUser } from '@tabler/icons-react'
import Link from '../../../components/Link'
import usePageMeta from '../../../hooks/usePageMeta'
import useInput from '../../../hooks/useInput'
import { register } from '../api/authApi'
import { showError } from '../../../helpers/toolsHelper'
import LoginForm from './LoginForm'

const PERKS = [
  [IconEdit, 'Editor Markdown dengan pratinjau langsung'],
  [IconBrain, 'AI Blog Generator untuk draf artikel instan'],
  [IconSearch, 'Sumber rujukan dari Search Engine'],
]

function RegisterForm({ onSuccess }) {
  const [username, onUsername] = useInput('')
  const [email, onEmail] = useInput('')
  const [password, onPassword] = useInput('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      onSuccess(await register({ username, email, password }))
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const icon = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300'
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="register-username" className="mb-1.5 block text-sm font-semibold">Username</label>
        <div className="relative">
          <IconUser size={18} className={icon} aria-hidden="true" />
          <input id="register-username" autoComplete="username" className="input !pl-10" value={username} onChange={onUsername} minLength={3} required />
        </div>
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold">Email</label>
        <div className="relative">
          <IconMail size={18} className={icon} aria-hidden="true" />
          <input id="register-email" type="email" autoComplete="email" className="input !pl-10" value={email} onChange={onEmail} required />
        </div>
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold">Password</label>
        <div className="relative">
          <IconLock size={18} className={icon} aria-hidden="true" />
          <input id="register-password" type="password" autoComplete="new-password" className="input !pl-10" value={password} onChange={onPassword} minLength={6} required />
        </div>
      </div>
      <button id="register-submit" type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Memproses...' : 'Daftar sebagai Penulis'}
      </button>
    </form>
  )
}

/** Halaman mandiri /login dan /register. */
export default function AuthPage({ mode = 'login', onAuthSuccess }) {
  const isLogin = mode === 'login'
  usePageMeta(
    isLogin ? 'Masuk - Delcom Blog' : 'Daftar - Delcom Blog',
    isLogin ? 'Masuk ke Delcom Blog untuk mengelola artikel Anda.' : 'Buat akun penulis Delcom Blog dan mulai menerbitkan artikel.',
  )
  return (
    <main className="mx-auto grid min-h-[calc(100vh-14rem)] w-full max-w-5xl items-stretch px-4 py-10 lg:grid-cols-2">
      <section aria-label="Tentang Delcom Blog" className="hero-bg hidden flex-col justify-between rounded-l-3xl p-10 text-white lg:flex">
        <p className="m-0 flex items-center gap-2 text-xl font-bold">
          <IconFeather size={26} aria-hidden="true" /> Delcom Blog
        </p>
        <div>
          <p className="m-0 text-3xl font-extrabold leading-tight">Tulis lebih cepat, terbit lebih percaya diri.</p>
          <ul className="m-0 mt-6 list-none space-y-3 p-0">
            {PERKS.map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-3 font-medium">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/20" aria-hidden="true"><Icon size={20} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="m-0 text-sm text-white">Platform publikasi artikel multi-tier.</p>
      </section>

      <section className="card flex flex-col justify-center rounded-3xl p-8 shadow-xl sm:p-10 lg:rounded-l-none">
        <h1 className="m-0 text-3xl font-extrabold tracking-tight">{isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}</h1>
        <p className="mb-6 mt-2 muted">
          {isLogin ? 'Kelola artikel dan gunakan AI Generator.' : 'Mulai menulis dan bagikan gagasan Anda.'}
        </p>
        {isLogin ? <LoginForm onSuccess={onAuthSuccess} /> : <RegisterForm onSuccess={onAuthSuccess} />}
        <p className="m-0 mt-6 text-center text-sm">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <Link to={isLogin ? '/register' : '/login'} className="font-semibold text-accent-ink underline">
            {isLogin ? 'Daftar' : 'Masuk'}
          </Link>
        </p>
      </section>
    </main>
  )
}
