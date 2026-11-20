import { IconX } from '@tabler/icons-react'
import Link from '../../../components/Link'
import LoginForm from '../components/LoginForm'

/** Modal login cepat dari navbar. */
export default function AuthModal({ open, onClose, onAuthSuccess }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="card w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="hero-bg flex items-center justify-between px-5 py-4 text-white">
          <h2 id="auth-modal-title" className="m-0 text-lg font-bold">Masuk</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 hover:bg-white/20 cursor-pointer"><IconX size={20} aria-hidden="true" /></button>
        </div>
        <div className="p-5">
          <LoginForm onSuccess={onAuthSuccess} />
          <p className="m-0 mt-4 text-center text-sm">
            Belum punya akun?{' '}
            <Link to="/register" onClick={onClose} className="font-semibold text-accent-ink underline">Daftar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
