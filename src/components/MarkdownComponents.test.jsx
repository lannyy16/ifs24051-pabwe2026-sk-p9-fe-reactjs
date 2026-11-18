import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const editorInstance = { getMarkdown: vi.fn(), setMarkdown: vi.fn(), destroy: vi.fn() }
let lastOptions
const viewerInstance = { setMarkdown: vi.fn(), destroy: vi.fn() }
let lastViewerOptions

vi.mock('@toast-ui/editor', () => {
  const Editor = vi.fn(function (opts) {
    lastOptions = opts
    return editorInstance
  })
  Editor.factory = vi.fn((opts) => {
    lastViewerOptions = opts
    return viewerInstance
  })
  return { default: Editor }
})
vi.mock('@toast-ui/editor/dist/toastui-editor.css', () => ({}))
vi.mock('@toast-ui/editor/dist/theme/toastui-editor-dark.css', () => ({}))

import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

beforeEach(() => {
  document.documentElement.classList.remove('dark')
  editorInstance.getMarkdown.mockReturnValue('')
})

describe('MarkdownEditor', () => {
  it('membuat editor, meneruskan perubahan, sinkron nilai, dan destroy saat unmount', () => {
    const onChange = vi.fn()
    editorInstance.getMarkdown.mockReturnValue('# isi')
    const { rerender, unmount } = render(<MarkdownEditor value="" onChange={onChange} />)
    expect(lastOptions.theme).toBe('light')
    expect(lastOptions.height).toBe('420px')

    lastOptions.events.change()
    expect(onChange).toHaveBeenCalledWith('# isi')
    expect(lastOptions.customHTMLSanitizer('<p>ok</p><img src=x onerror=alert(1)>')).not.toContain('onerror')

    editorInstance.getMarkdown.mockReturnValue('lama')
    rerender(<MarkdownEditor value="baru" onChange={onChange} />)
    expect(editorInstance.setMarkdown).toHaveBeenCalledWith('baru')

    editorInstance.setMarkdown.mockClear()
    editorInstance.getMarkdown.mockReturnValue('sama')
    rerender(<MarkdownEditor value="sama" onChange={onChange} />)
    expect(editorInstance.setMarkdown).not.toHaveBeenCalled()

    unmount()
    expect(editorInstance.destroy).toHaveBeenCalled()
  })

  it('memakai tema dark dan aman tanpa onChange', () => {
    document.documentElement.classList.add('dark')
    render(<MarkdownEditor />)
    expect(lastOptions.theme).toBe('dark')
    expect(() => lastOptions.events.change()).not.toThrow()
  })
})

describe('MarkdownViewer', () => {
  it('membuat viewer, memperbarui konten, dan destroy saat unmount', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="halo" />)
    expect(lastViewerOptions.viewer).toBe(true)
    expect(lastViewerOptions.theme).toBe('light')
    expect(lastViewerOptions.customHTMLSanitizer('<script>alert(1)</script><b>x</b>')).toBe('<b>x</b>')
    rerender(<MarkdownViewer content="dunia" />)
    expect(viewerInstance.setMarkdown).toHaveBeenCalledWith('dunia')
    unmount()
    expect(viewerInstance.destroy).toHaveBeenCalled()
  })

  it('tema dark dan konten default', () => {
    document.documentElement.classList.add('dark')
    render(<MarkdownViewer />)
    expect(lastViewerOptions.theme).toBe('dark')
    expect(lastViewerOptions.initialValue).toBe('')
  })
})
