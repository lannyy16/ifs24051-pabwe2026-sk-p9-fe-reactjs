import { useState } from 'react'
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
        <label htmlFor="login-username" className="mb-1 block text-sm font-medium">Username / Email</label>
        <input id="login-username" className="input" value={username} onChange={onUsername} required />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="login-password" type="password" className="input" value={password} onChange={onPassword} required />
      </div>
      <button id="login-submit" type="submit" className="btn-primary w-full justify-center" disabled={loading}>
        {loading ? 'Memproses...' : 'Masuk'}
      </button>
    </form>
  )
}
