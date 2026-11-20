import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconPlus, IconSparkles } from '@tabler/icons-react'
import Link from '../../../components/Link'
import usePageMeta from '../../../hooks/usePageMeta'
import PostStats from './PostStats'
import PostModal from '../modals/PostModal'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'
import { deletePost, getMyPosts, getStats, togglePublish } from '../api/blogApi'
import { confirmDelete, formatDate, showError, showSuccess } from '../../../helpers/toolsHelper'

const menuItem = 'block w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer'

/** Ruang kerja penulis (full width): statistik, tabel artikel, kebab menu, toggle terbit. */
export default function AuthorDashboard({ startCreate = false }) {
  usePageMeta('Workspace Penulis - Delcom Blog', 'Kelola artikel, status terbit, dan gunakan AI Generator di workspace penulis Delcom Blog.')
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total_articles: 0, total_selesai: 0, belum_selesai: 0 })
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight">Ruang Kerja Penulis</h1>
          <p className="m-0 mt-1 muted">Kelola artikel Anda dan terbitkan kapan saja.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={() => setModal({ type: 'ai', post: null, initial: null })}>
            <IconSparkles size={16} aria-hidden="true" /> AI Generator
          </button>
          <button type="button" className="btn-primary" onClick={() => setModal({ type: 'post', post: null, initial: null })}>
            <IconPlus size={16} aria-hidden="true" /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <section className="card overflow-x-auto" aria-label="Daftar artikel saya">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Artikel milik Anda</caption>
          <thead className="bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100">
            <tr>
              <th scope="col" className="px-5 py-3.5">Judul</th>
              <th scope="col" className="px-5 py-3.5">Kategori</th>
              <th scope="col" className="px-5 py-3.5">Terbit</th>
              <th scope="col" className="px-5 py-3.5">Dibuat</th>
              <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-5 py-8 text-center muted">Memuat...</td></tr>}
            {!loading && posts.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center muted">Belum ada artikel. Klik &quot;Tambah Artikel&quot; atau coba AI Generator.</td></tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-5 py-3.5 font-semibold">{p.title}</td>
                <td className="px-5 py-3.5"><span className="badge">{p.category}</span></td>
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={p.is_published}
                    aria-label={`Status terbit ${p.title}`}
                    onClick={() => toggle(p)}
                    className={`relative h-7 w-12 rounded-full transition cursor-pointer ${p.is_published ? 'bg-accent' : 'bg-slate-400 dark:bg-slate-600'}`}
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${p.is_published ? 'left-6' : 'left-1'}`} />
                  </button>
                </td>
                <td className="px-5 py-3.5">{formatDate(p.created_at)}</td>
                <td className="relative px-5 py-3.5 text-right">
                  <button type="button" aria-label={`Menu ${p.title}`} className="btn-ghost !min-h-9 !px-2.5"
                    onClick={() => setMenuId(menuId === p.id ? null : p.id)}>
                    <IconDotsVertical size={16} aria-hidden="true" />
                  </button>
                  {menuId === p.id && (
                    <div className="card absolute right-5 z-10 mt-1 w-44 overflow-hidden py-1 text-left shadow-xl">
                      <button type="button" className={menuItem} onClick={() => edit(p)}>Edit</button>
                      {p.is_published && (
                        <Link to={`/posts/${p.slug}`} className={menuItem} onClick={() => setMenuId(null)}>Lihat</Link>
                      )}
                      <button type="button" className={`${menuItem} text-rose-700 dark:text-rose-400`} onClick={() => remove(p)}>Hapus</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

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
