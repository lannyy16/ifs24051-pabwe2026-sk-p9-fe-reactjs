import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AuthPage from './AuthPage'
import { login, register } from '../api/authApi'
import { showError } from '../../../helpers/toolsHelper'

vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ showError: vi.fn() }))

const deferred = () => {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

describe('AuthPage (login)', () => {
  it('menyediakan id wajib dan mengirim kredensial', async () => {
    login.mockResolvedValue({ token: 't', user: { id: 1 } })
    const onAuthSuccess = vi.fn()
    render(<AuthPage mode="login" onAuthSuccess={onAuthSuccess} />)

    await userEvent.type(document.getElementById('login-username'), 'admin')
    await userEvent.type(document.getElementById('login-password'), 'rahasia')
    await userEvent.click(document.getElementById('login-submit'))

    await waitFor(() => expect(onAuthSuccess).toHaveBeenCalledWith({ token: 't', user: { id: 1 } }))
    expect(login).toHaveBeenCalledWith('admin', 'rahasia')
  })

  it('menampilkan status memproses lalu error bila gagal', async () => {
    const d = deferred()
    login.mockReturnValueOnce(d.promise)
    render(<AuthPage onAuthSuccess={vi.fn()} />)
    await userEvent.type(document.getElementById('login-username'), 'a')
    await userEvent.type(document.getElementById('login-password'), 'b')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByText('Memproses...')).toBeInTheDocument()

    login.mockRejectedValueOnce(new Error('salah'))
    d.resolve({ token: 't', user: {} })
    await waitFor(() => expect(screen.getByText('Masuk', { selector: 'button#login-submit' })).toBeInTheDocument())

    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('salah'))
  })

  it('tautan beralih ke halaman daftar', async () => {
    render(<AuthPage mode="login" onAuthSuccess={vi.fn()} />)
    await userEvent.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(window.location.pathname).toBe('/register')
    expect(document.title).toMatch(/Masuk/)
  })
})

describe('AuthPage (register)', () => {
  it('mendaftarkan penulis baru', async () => {
    register.mockResolvedValue({ token: 't', user: { id: 2 } })
    const onAuthSuccess = vi.fn()
    render(<AuthPage mode="register" onAuthSuccess={onAuthSuccess} />)

    await userEvent.type(document.getElementById('register-username'), 'budi')
    await userEvent.type(document.getElementById('register-email'), 'budi@mail.com')
    await userEvent.type(document.getElementById('register-password'), '123456')
    await userEvent.click(document.getElementById('register-submit'))

    await waitFor(() => expect(onAuthSuccess).toHaveBeenCalled())
    expect(register).toHaveBeenCalledWith({ username: 'budi', email: 'budi@mail.com', password: '123456' })
  })

  it('memproses, error, dan tautan kembali ke login', async () => {
    const d = deferred()
    register.mockReturnValueOnce(d.promise)
    render(<AuthPage mode="register" onAuthSuccess={vi.fn()} />)
    await userEvent.type(document.getElementById('register-username'), 'budi')
    await userEvent.type(document.getElementById('register-email'), 'budi@mail.com')
    await userEvent.type(document.getElementById('register-password'), '123456')
    await userEvent.click(document.getElementById('register-submit'))
    expect(await screen.findByText('Memproses...')).toBeInTheDocument()
    d.resolve({ token: 't', user: {} })

    register.mockRejectedValueOnce(new Error('dipakai'))
    await waitFor(() => expect(screen.getByText('Daftar sebagai Penulis')).toBeInTheDocument())
    await userEvent.click(document.getElementById('register-submit'))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('dipakai'))

    await userEvent.click(screen.getByRole('link', { name: 'Masuk' }))
    expect(window.location.pathname).toBe('/login')
    expect(document.title).toMatch(/Daftar/)
  })
})
