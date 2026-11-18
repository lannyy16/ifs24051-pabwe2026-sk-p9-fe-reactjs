import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import DOMPurify from 'dompurify'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

/** Wrapper Toast UI Viewer untuk menampilkan konten Markdown. */
export default function MarkdownViewer({ content = '' }) {
  const rootRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    viewerRef.current = Editor.factory({
      el: rootRef.current,
      viewer: true,
      initialValue: content,
      usageStatistics: false,
      customHTMLSanitizer: (html) => DOMPurify.sanitize(html),
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    })
    return () => viewerRef.current.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    viewerRef.current.setMarkdown(content)
  }, [content])

  return <div ref={rootRef} data-testid="markdown-viewer" />
}
