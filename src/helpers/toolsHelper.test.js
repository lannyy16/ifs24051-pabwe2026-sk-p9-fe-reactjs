import { describe, expect, it, vi } from 'vitest'
import Swal from 'sweetalert2'
import { confirmDelete, formatDate, showError, showSuccess } from './toolsHelper'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

describe('toolsHelper', () => {
  it('showSuccess & showError memanggil Swal', async () => {
    await showSuccess('ok')
    await showError('gagal')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', text: 'ok' }))
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'gagal' }))
  })

  it('confirmDelete mengembalikan isConfirmed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    expect(await confirmDelete('Judul')).toBe(true)
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await confirmDelete('Judul')).toBe(false)
  })

  it('formatDate memformat tanggal Indonesia dan "-" bila kosong', () => {
    expect(formatDate('2026-03-05T10:00:00Z')).toMatch(/2026/)
    expect(formatDate(null)).toBe('-')
  })
})
