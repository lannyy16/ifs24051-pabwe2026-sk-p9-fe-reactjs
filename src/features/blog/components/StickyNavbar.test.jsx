import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const props = () => ({
  user: null, theme: 'light', onToggleTheme: vi.fn(), accent: 'indigo', onAccent: vi.fn(),
  onLogout: vi.fn(), onOpenLogin: vi.fn(),
})

describe('StickyNavbar', () => {
  it('tamu: Masuk (modal), Daftar (tautan), brand, tema, dan aksen', async () => {
    const p = props()
    render(<StickyNavbar {...p} />)
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(p.onOpenLogin).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(window.location.pathname).toBe('/register')
    await userEvent.click(screen.getByRole('link', { name: /Delcom Blog/ }))
    expect(window.location.pathname).toBe('/')
    await userEvent.click(screen.getByRole('link', { name: 'Beranda' }))
    await userEvent.click(screen.getByLabelText('Aktifkan mode gelap'))
    expect(p.onToggleTheme).toHaveBeenCalled()
    await userEvent.click(screen.getByLabelText('Aksen rose'))
    expect(p.onAccent).toHaveBeenCalledWith('rose')
    expect(screen.getByLabelText('Aksen indigo')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
  })

  it('member: Workspace & Keluar tanpa menu Admin; tema dark', async () => {
    const p = props()
    render(<StickyNavbar {...p} user={{ role: 'member' }} theme="dark" />)
    await userEvent.click(screen.getByRole('link', { name: 'Workspace' }))
    expect(window.location.pathname).toBe('/dashboard')
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(p.onLogout).toHaveBeenCalled()
    expect(screen.getByLabelText('Aktifkan mode terang')).toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('admin: menampilkan menu Admin', async () => {
    render(<StickyNavbar {...props()} user={{ role: 'admin' }} />)
    await userEvent.click(screen.getByRole('link', { name: 'Admin' }))
    expect(window.location.pathname).toBe('/admin')
  })
})
