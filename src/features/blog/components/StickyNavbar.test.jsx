import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const props = () => ({
  user: null, theme: 'light', onToggleTheme: vi.fn(), accent: 'indigo', onAccent: vi.fn(),
  navigate: vi.fn(), onLogout: vi.fn(), onOpenLogin: vi.fn(),
})

describe('StickyNavbar', () => {
  it('tamu: tombol Masuk & Daftar, brand, tema, dan aksen', async () => {
    const p = props()
    render(<StickyNavbar {...p} />)
    await userEvent.click(screen.getByText('Delcom Blog'))
    expect(p.navigate).toHaveBeenCalledWith('/')
    await userEvent.click(screen.getByText('Masuk'))
    expect(p.onOpenLogin).toHaveBeenCalled()
    await userEvent.click(screen.getByText('Daftar'))
    expect(p.navigate).toHaveBeenCalledWith('/register')
    await userEvent.click(screen.getByLabelText('Ganti tema'))
    expect(p.onToggleTheme).toHaveBeenCalled()
    await userEvent.click(screen.getByLabelText('Aksen rose'))
    expect(p.onAccent).toHaveBeenCalledWith('rose')
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
  })

  it('member: Workspace & Keluar tanpa menu Admin; tema dark', async () => {
    const p = props()
    render(<StickyNavbar {...p} user={{ role: 'member' }} theme="dark" />)
    await userEvent.click(screen.getByText('Workspace'))
    expect(p.navigate).toHaveBeenCalledWith('/author')
    await userEvent.click(screen.getByText('Keluar'))
    expect(p.onLogout).toHaveBeenCalled()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('admin: menampilkan menu Admin', async () => {
    const p = props()
    render(<StickyNavbar {...p} user={{ role: 'admin' }} />)
    await userEvent.click(screen.getByText('Admin'))
    expect(p.navigate).toHaveBeenCalledWith('/admin')
  })
})
