import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AiPostGeneratorModal from './AiPostGeneratorModal'
import { aiGenerate } from '../api/blogApi'
import { showError } from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({ CATEGORIES: ['Teknologi', 'Umum'], aiGenerate: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ showError: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))

const result = (over = {}) => ({
  title: 'Judul AI', category: 'Teknologi', excerpt: 'ringkas', content: '# konten',
  used_web_search: true, sources: [{ title: 'Sumber 1', url: 'http://s1' }], ...over,
})

const deferred = () => {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

describe('AiPostGeneratorModal', () => {
  it('tidak merender saat tertutup', () => {
    const { container } = render(<AiPostGeneratorModal open={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('menolak topik terlalu pendek', async () => {
    render(<AiPostGeneratorModal open onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik Artikel'), 'ab')
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(showError).toHaveBeenCalledWith('Topik minimal 3 karakter')
    expect(aiGenerate).not.toHaveBeenCalled()
  })

  it('menghasilkan artikel dengan sumber, lalu menerapkannya', async () => {
    aiGenerate.mockResolvedValue(result())
    const onApply = vi.fn()
    render(<AiPostGeneratorModal open onClose={vi.fn()} onApply={onApply} />)

    await userEvent.type(screen.getByLabelText('Topik Artikel'), 'Golang')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Teknologi')
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(await screen.findByText('Judul AI')).toBeInTheDocument()
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'Golang', category: 'Teknologi', include_web_search: true })
    expect(screen.getByText('Sumber 1')).toHaveAttribute('href', 'http://s1')

    await userEvent.click(screen.getByRole('button', { name: 'Gunakan Artikel' }))
    expect(onApply).toHaveBeenCalledWith(result())
  })

  it('tanpa penelusuran: tidak menampilkan sumber', async () => {
    aiGenerate.mockResolvedValue(result({ used_web_search: false, sources: [] }))
    render(<AiPostGeneratorModal open onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik Artikel'), 'Golang')
    await userEvent.click(screen.getByLabelText(/Sertakan penelusuran/))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByText('Judul AI')).toBeInTheDocument()
    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'Golang', category: '', include_web_search: false })
    expect(screen.queryByText('Sumber Rujukan')).not.toBeInTheDocument()
  })

  it('menampilkan status loading dan error', async () => {
    const d = deferred()
    aiGenerate.mockReturnValueOnce(d.promise)
    render(<AiPostGeneratorModal open onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik Artikel'), 'Golang')
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByText('Menghasilkan...')).toBeInTheDocument()
    d.resolve(result())
    await screen.findByText('Judul AI')

    aiGenerate.mockRejectedValueOnce(new Error('AI mati'))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('AI mati'))
  })

  it('menutup modal', async () => {
    const onClose = vi.fn()
    render(<AiPostGeneratorModal open onClose={onClose} onApply={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
