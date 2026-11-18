import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import DOMPurify from 'dompurify'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

/** Wrapper Toast UI Editor (WYSIWYG/Markdown, preview, tema gelap). */
export default function MarkdownEditor({ value = '', onChange, height = '420px' }) {
  const rootRef = useRef(null)
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const editor = new Editor({
      el: rootRef.current,
      height,
      initialValue: value,
      initialEditType: 'markdown',
      previewStyle: 'tab',
      usageStatistics: false,
      customHTMLSanitizer: (html) => DOMPurify.sanitize(html),
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      events: { change: () => onChangeRef.current?.(editor.getMarkdown()) },
    })
    editorRef.current = editor
    return () => editor.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (editor && editor.getMarkdown() !== value) editor.setMarkdown(value)
  }, [value])

  return <div ref={rootRef} data-testid="markdown-editor" />
}
