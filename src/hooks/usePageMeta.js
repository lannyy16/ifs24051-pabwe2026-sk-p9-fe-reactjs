import { useEffect } from 'react'

/** Mengatur <title> dan meta description untuk halaman aktif (SPA). */
export default function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [title, description])
}
