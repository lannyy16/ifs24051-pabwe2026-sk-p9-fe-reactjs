import { useState } from 'react'
import { IconLock, IconUser } from '@tabler/icons-react'
import useInput from '../../../hooks/useInput'
import { login } from '../api/authApi'
import { showError } from '../../../helpers/toolsHelper'

/** Form login bersama (dipakai AuthPage dan AuthModal). */
export default function LoginForm({ onSuccess }) {
  const [username, onUsername] = useInput('')
  const [password, onPassword] = useInput('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      onSuccess(await login(username, password))
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="login-username" className="mb-1.5 block text-sm font-semibold">Username / Email</label>
        <div className="relative">
          <IconUser size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300" aria-hidden="true" />
          <input id="login-username" autoComplete="username" className="input !pl-10" value={username} onChange={onUsername} required />
        </div>
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold">Password</label>
        <div className="relative">
          <IconLock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300" aria-hidden="true" />
          <input id="login-password" type="password" autoComplete="current-password" className="input !pl-10" value={password} onChange={onPassword} required />
        </div>
      </div>
      <button id="login-submit" type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Memproses...' : 'Masuk'}
      </button>
    </form>
  )
}
