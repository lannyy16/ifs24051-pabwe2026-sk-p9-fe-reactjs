import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Link from './Link'

describe('Link', () => {
  it('berupa anchor dengan href dan berpindah tanpa reload', async () => {
    render(<Link to="/register" className="x">Daftar</Link>)
    const a = screen.getByRole('link', { name: 'Daftar' })
    expect(a).toHaveAttribute('href', '/register')
    await userEvent.click(a)
    expect(window.location.pathname).toBe('/register')
  })

  it('memanggil onClick tambahan', async () => {
    const onClick = vi.fn()
    render(<Link to="/login" onClick={onClick}>Masuk</Link>)
    await userEvent.click(screen.getByRole('link'))
    expect(onClick).toHaveBeenCalled()
    expect(window.location.pathname).toBe('/login')
  })

  it('tidak menghalangi buka di tab baru (ctrl/meta/shift/klik tengah)', () => {
    window.history.pushState({}, '', '/awal')
    render(<Link to="/lain">Lain</Link>)
    const a = screen.getByRole('link')
    a.addEventListener('click', (e) => e.preventDefault()) // jsdom tidak mengimplementasi navigasi
    fireEvent.click(a, { ctrlKey: true })
    fireEvent.click(a, { metaKey: true })
    fireEvent.click(a, { shiftKey: true })
    fireEvent.click(a, { button: 1 })
    expect(window.location.pathname).toBe('/awal')
  })
})
