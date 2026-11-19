import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import { register } from '../api/authApi'
import { showError } from '../../../helpers/toolsHelper'
import LoginForm from './LoginForm'

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

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="register-username" className="mb-1 block text-sm font-medium">Username</label>
        <input id="register-username" className="input" value={username} onChange={onUsername} minLength={3} required />
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="register-email" type="email" className="input" value={email} onChange={onEmail} required />
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="register-password" type="password" className="input" value={password} onChange={onPassword} minLength={6} required />
      </div>
      <button id="register-submit" type="submit" className="btn-primary w-full justify-center" disabled={loading}>
        {loading ? 'Memproses...' : 'Daftar sebagai Penulis'}
      </button>
    </form>
  )
}

/** Halaman mandiri /login dan /register. */
export default function AuthPage({ mode = 'login', onAuthSuccess, navigate }) {
  const isLogin = mode === 'login'
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4">
      <div className="card w-full p-6">
        <h1 className="mb-1 text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}</h1>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
          {isLogin ? 'Kelola artikel dan gunakan AI Generator.' : 'Mulai menulis dan bagikan gagasan Anda.'}
        </p>
        {isLogin ? <LoginForm onSuccess={onAuthSuccess} /> : <RegisterForm onSuccess={onAuthSuccess} />}
        <p className="mt-4 text-center text-sm">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button type="button" className="font-medium text-accent-ink hover:underline cursor-pointer"
            onClick={() => navigate(isLogin ? '/register' : '/login')}>
            {isLogin ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </main>
  )
}
