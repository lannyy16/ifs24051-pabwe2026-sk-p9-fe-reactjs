import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AuthModal from './AuthModal'
import { login } from '../api/authApi'

vi.mock('../api/authApi', () => ({ login: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ showError: vi.fn() }))

describe('AuthModal', () => {
  it('tidak merender apa pun saat tertutup', () => {
    const { container } = render(<AuthModal open={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('login dari modal, menutup, dan mengarahkan ke daftar', async () => {
    login.mockResolvedValue({ token: 't', user: {} })
    const onClose = vi.fn()
    const onAuthSuccess = vi.fn()
    const navigate = vi.fn()
    render(<AuthModal open onClose={onClose} onAuthSuccess={onAuthSuccess} navigate={navigate} />)

    await userEvent.type(document.getElementById('login-username'), 'member')
    await userEvent.type(document.getElementById('login-password'), 'member')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onAuthSuccess).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(navigate).toHaveBeenCalledWith('/register')
  })
})
