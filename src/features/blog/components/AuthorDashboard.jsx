import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconPlus, IconSparkles } from '@tabler/icons-react'
import PostStats from './PostStats'
import PostModal from '../modals/PostModal'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'
import { deletePost, getMyPosts, getStats, togglePublish } from '../api/blogApi'
import { confirmDelete, formatDate, showError, showSuccess } from '../../../helpers/toolsHelper'

/** Ruang kerja penulis (full width): statistik, tabel artikel, kebab menu, toggle terbit. */
export default function AuthorDashboard({ navigate, startCreate = false }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 })
  const [loading, setLoading] = useState(true)
  const [menuId, setMenuId] = useState(null)
  const [modal, setModal] = useState({ type: startCreate ? 'post' : null, post: null, initial: null })

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([getMyPosts(), getStats()])
      setPosts(p)
      setStats(s)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const closeModal = () => setModal({ type: null, post: null, initial: null })

  const toggle = async (p) => {
    try {
      await togglePublish(p.id)
      await load()
    } catch (err) {
      showError(err.message)
    }
  }

  const remove = async (p) => {
    setMenuId(null)
    if (!(await confirmDelete(p.title))) return
    try {
      await deletePost(p.id)
      showSuccess('Artikel berhasil dihapus')
      await load()
    } catch (err) {
      showError(err.message)
    }
  }

  const edit = (p) => {
    setMenuId(null)
    setModal({ type: 'post', post: p, initial: null })
  }

  return (
    <main className="mx-auto w-full max-w-[96vw] space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ruang Kerja Penulis</h1>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={() => setModal({ type: 'ai', post: null, initial: null })}>
            <IconSparkles size={16} /> AI Generator
          </button>
          <button type="button" className="btn-primary" onClick={() => setModal({ type: 'post', post: null, initial: null })}>
            <IconPlus size={16} /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Terbit</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-600 dark:text-slate-300">Memuat...</td></tr>}
            {!loading && posts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-600 dark:text-slate-300">Belum ada artikel.</td></tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">
                  <button type="button" role="switch" aria-checked={p.is_published}
                    aria-label={`Status terbit ${p.title}`} onClick={() => toggle(p)}
                    className={`relative h-6 w-11 rounded-full transition cursor-pointer ${p.is_published ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${p.is_published ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">{formatDate(p.created_at)}</td>
                <td className="relative px-4 py-3 text-right">
                  <button type="button" aria-label={`Menu ${p.title}`} className="btn-ghost px-2"
                    onClick={() => setMenuId(menuId === p.id ? null : p.id)}>
                    <IconDotsVertical size={16} />
                  </button>
                  {menuId === p.id && (
                    <div className="card absolute right-4 z-10 mt-1 w-40 py-1 text-left">
                      <button type="button" className="block w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" onClick={() => edit(p)}>Edit</button>
                      {p.is_published && (
                        <button type="button" className="block w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" onClick={() => { setMenuId(null); navigate(`/posts/${p.slug}`) }}>Lihat</button>
                      )}
                      <button type="button" className="block w-full px-4 py-2 text-left text-rose-700 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" onClick={() => remove(p)}>Hapus</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PostModal
        open={modal.type === 'post'}
        post={modal.post}
        initial={modal.initial}
        onClose={closeModal}
        onSaved={() => { closeModal(); load() }}
      />
      <AiPostGeneratorModal
        open={modal.type === 'ai'}
        onClose={closeModal}
        onApply={(article) => setModal({ type: 'post', post: null, initial: article })}
      />
    </main>
  )
}
