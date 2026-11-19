import { lazy, Suspense, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import useInput from '../../../hooks/useInput'
import { CATEGORIES, createPost, updatePost } from '../api/blogApi'
import { showError, showSuccess } from '../../../helpers/toolsHelper'

const MarkdownEditor = lazy(() => import('../../../components/MarkdownEditor'))

function PostForm({ post, initial, onClose, onSaved }) {
  const source = post ?? initial ?? {}
  const [title, onTitle] = useInput(source.title ?? '')
  const [category, onCategory] = useInput(source.category ?? 'Umum')
  const [excerpt, onExcerpt] = useInput(source.excerpt ?? '')
  const [cover, onCover] = useInput(source.cover_image_path ?? '')
  const [content, setContent] = useState(source.content ?? '')
  const [published, setPublished] = useState(source.is_published ?? false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      showError('Judul dan isi artikel wajib diisi')
      return
    }
    setSaving(true)
    const payload = {
      title, category, excerpt, content, cover_image_path: cover, is_published: published,
    }
    try {
      if (post) await updatePost(post.id, payload)
      else await createPost(payload)
      showSuccess(post ? 'Artikel berhasil diperbarui' : 'Artikel berhasil dibuat')
      onSaved()
    } catch (err) {
      showError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="card flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden">
        <div className="flex items-center justify-between bg-accent px-5 py-3 text-white">
          <h2 className="text-lg font-semibold">{post ? 'Edit Artikel' : 'Tambah Artikel'}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="cursor-pointer"><IconX size={22} /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="post-title" className="mb-1 block text-sm font-medium">Judul</label>
              <input id="post-title" className="input" value={title} onChange={onTitle} />
            </div>
            <div>
              <label htmlFor="post-category" className="mb-1 block text-sm font-medium">Kategori</label>
              <select id="post-category" className="input" value={category} onChange={onCategory}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="post-excerpt" className="mb-1 block text-sm font-medium">Ringkasan (opsional)</label>
              <input id="post-excerpt" className="input" value={excerpt} onChange={onExcerpt} />
            </div>
            <div>
              <label htmlFor="post-cover" className="mb-1 block text-sm font-medium">URL Gambar Sampul (opsional)</label>
              <input id="post-cover" className="input" value={cover} onChange={onCover} />
            </div>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Isi Artikel (Markdown)</span>
            <Suspense fallback={<p className="text-slate-600 dark:text-slate-300">Memuat editor...</p>}>
              <MarkdownEditor value={content} onChange={setContent} />
            </Suspense>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Terbitkan sekarang
          </label>
        </div>

        <div className="flex justify-end gap-2 bg-slate-100 px-5 py-3 dark:bg-slate-700">
          <button type="button" className="btn-ghost" onClick={onClose}>Batal</button>
          <button type="button" className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Modal full screen penulisan / edit artikel dengan Toast UI Editor. */
export default function PostModal({ open, post, initial, onClose, onSaved }) {
  if (!open) return null
  return <PostForm post={post} initial={initial} onClose={onClose} onSaved={onSaved} />
}
