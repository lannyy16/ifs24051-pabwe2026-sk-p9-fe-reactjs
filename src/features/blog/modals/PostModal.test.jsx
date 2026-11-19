import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PostModal from './PostModal'
import { createPost, updatePost } from '../api/blogApi'
import { showError, showSuccess } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({
  CATEGORIES: ['Teknologi', 'Umum'],
  createPost: vi.fn(),
  updatePost: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper', () => ({ showError: vi.fn(), showSuccess: vi.fn() }))
vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => (
    <textarea aria-label="editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

const deferred = () => {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

describe('PostModal', () => {
  it('tidak merender saat tertutup', () => {
    const { container } = render(<PostModal open={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('membuat artikel baru dengan seluruh kolom', async () => {
    createPost.mockResolvedValue({})
    const onSaved = vi.fn()
    render(<PostModal open post={null} initial={null} onClose={vi.fn()} onSaved={onSaved} />)
    expect(screen.getByText('Tambah Artikel')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Judul'), 'Judul Baru')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Teknologi')
    await userEvent.type(screen.getByLabelText('Ringkasan (opsional)'), 'ringkas')
    await userEvent.type(screen.getByLabelText('URL Gambar Sampul (opsional)'), 'http://c')
    await userEvent.type(await screen.findByLabelText('editor'), 'isi')
    await userEvent.click(screen.getByLabelText('Terbitkan sekarang'))
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))

    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(createPost).toHaveBeenCalledWith({
      title: 'Judul Baru', category: 'Teknologi', excerpt: 'ringkas', content: 'isi',
      cover_image_path: 'http://c', is_published: true,
    })
    expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil dibuat')
  })

  it('menolak simpan bila judul / isi kosong', async () => {
    render(<PostModal open post={null} initial={null} onClose={vi.fn()} onSaved={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(showError).toHaveBeenCalledWith('Judul dan isi artikel wajib diisi')
    expect(createPost).not.toHaveBeenCalled()
  })

  it('mengedit artikel yang ada', async () => {
    updatePost.mockResolvedValue({})
    const post = {
      id: 9, title: 'Lama', category: 'Teknologi', excerpt: 'e', cover_image_path: 'c', content: 'isi lama', is_published: true,
    }
    const onSaved = vi.fn()
    render(<PostModal open post={post} initial={null} onClose={vi.fn()} onSaved={onSaved} />)
    expect(screen.getByText('Edit Artikel')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    expect(screen.getByLabelText('Terbitkan sekarang')).toBeChecked()

    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(updatePost).toHaveBeenCalledWith(9, expect.objectContaining({ title: 'Lama', content: 'isi lama' }))
    expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil diperbarui')
  })

  it('terisi otomatis dari hasil AI (initial)', async () => {
    render(<PostModal open post={null} initial={{ title: 'Dari AI', content: 'konten AI', category: 'Umum' }} onClose={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByLabelText('Judul')).toHaveValue('Dari AI')
    expect(await screen.findByLabelText('editor')).toHaveValue('konten AI')
  })

  it('menampilkan error API dan status menyimpan', async () => {
    const d = deferred()
    createPost.mockReturnValueOnce(d.promise)
    const onSaved = vi.fn()
    render(<PostModal open post={null} initial={{ title: 'T', content: 'C' }} onClose={vi.fn()} onSaved={onSaved} />)
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByText('Menyimpan...')).toBeInTheDocument()
    createPost.mockRejectedValueOnce(new Error('gagal simpan'))
    d.resolve({})
    await waitFor(() => expect(onSaved).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('gagal simpan'))
  })

  it('menutup lewat tombol X dan Batal', async () => {
    const onClose = vi.fn()
    render(<PostModal open post={null} initial={null} onClose={onClose} onSaved={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
