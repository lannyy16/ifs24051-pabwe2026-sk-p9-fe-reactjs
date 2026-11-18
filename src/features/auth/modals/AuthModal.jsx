import { IconX } from '@tabler/icons-react'
import LoginForm from '../components/LoginForm'

/** Modal login cepat dari navbar halaman publik. */
export default function AuthModal({ open, onClose, onAuthSuccess, navigate }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="card w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between bg-accent px-5 py-3 text-white">
          <h2 className="font-semibold">Masuk</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="cursor-pointer"><IconX size={20} /></button>
        </div>
        <div className="p-5">
          <LoginForm onSuccess={onAuthSuccess} />
          <p className="mt-4 text-center text-sm">
            Belum punya akun?{' '}
            <button type="button" className="font-medium text-accent hover:underline cursor-pointer"
              onClick={() => { onClose(); navigate('/register') }}>Daftar</button>
          </p>
        </div>
      </div>
    </div>
  )
}
