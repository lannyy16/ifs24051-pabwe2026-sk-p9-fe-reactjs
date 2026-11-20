import { useCallback, useEffect, useState } from 'react'
import { IconArticle, IconUsers, IconWorldUpload } from '@tabler/icons-react'
import usePageMeta from '../../../hooks/usePageMeta'
import StatCard from '../../../components/StatCard'
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi'
import { formatDate, showError } from '../../../helpers/toolsHelper'

const th = 'px-5 py-3.5'
const td = 'px-5 py-3.5'

/** Panel admin (full width): monitoring pengguna & seluruh artikel. */
export default function AdminDashboard() {
  usePageMeta('Panel Admin - Delcom Blog', 'Pantau pengguna dan seluruh artikel di Delcom Blog.')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)

  const loadAll = useCallback(async () => {
    try {
      const [u, p] = await Promise.all([getUsers(), getAllPosts()])
      setUsers(u)
      setPosts(p)
      setSelected(null)
    } catch (err) {
      showError(err.message)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const showUserPosts = async (user) => {
    try {
      setPosts(await getUserPosts(user.id))
      setSelected(user)
    } catch (err) {
      showError(err.message)
    }
  }

  const totalPosts = users.reduce((n, u) => n + u.total_posts, 0)
  const totalPublished = users.reduce((n, u) => n + u.total_published, 0)

  return (
    <main className="mx-auto w-full max-w-[96vw] space-y-6 py-8">
      <div>
        <h1 className="m-0 text-3xl font-extrabold tracking-tight">Panel Administrasi</h1>
        <p className="m-0 mt-1 muted">Pantau seluruh pengguna dan artikel yang beredar.</p>
      </div>

      <section aria-label="Ringkasan" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Pengguna" value={users.length} icon={IconUsers} />
        <StatCard label="Total Artikel" value={totalPosts} icon={IconArticle} />
        <StatCard label="Total Terbit" value={totalPublished} icon={IconWorldUpload} />
      </section>

      <section className="card overflow-x-auto" aria-labelledby="users-title">
        <h2 id="users-title" className="m-0 px-5 pt-5 text-lg font-bold">Direktori Pengguna</h2>
        <table className="mt-3 w-full text-left text-sm">
          <caption className="sr-only">Daftar pengguna</caption>
          <thead className="bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100">
            <tr>
              <th scope="col" className={th}>ID</th><th scope="col" className={th}>Username</th><th scope="col" className={th}>Email</th>
              <th scope="col" className={th}>Role</th><th scope="col" className={th}>Artikel</th><th scope="col" className={th}>Terbit</th>
              <th scope="col" className={`${th} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className={td}>{u.id}</td><td className={`${td} font-semibold`}>{u.username}</td>
                <td className={td}>{u.email}</td><td className={td}><span className="badge">{u.role}</span></td>
                <td className={td}>{u.total_posts}</td><td className={td}>{u.total_published}</td>
                <td className={`${td} text-right`}>
                  <button type="button" className="btn-ghost !min-h-9" onClick={() => showUserPosts(u)}>Lihat Artikel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card overflow-x-auto" aria-labelledby="posts-title">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
          <h2 id="posts-title" className="m-0 text-lg font-bold">{selected ? `Artikel milik ${selected.username}` : 'Seluruh Artikel'}</h2>
          {selected && <button type="button" className="btn-ghost !min-h-9" onClick={loadAll}>Tampilkan Semua</button>}
        </div>
        <table className="mt-3 w-full text-left text-sm">
          <caption className="sr-only">Daftar artikel</caption>
          <thead className="bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100">
            <tr>
              <th scope="col" className={th}>Judul</th><th scope="col" className={th}>Penulis</th><th scope="col" className={th}>Kategori</th>
              <th scope="col" className={th}>Status</th><th scope="col" className={th}>Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center muted">Tidak ada artikel.</td></tr>}
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className={`${td} font-semibold`}>{p.title}</td><td className={td}>{p.author.username}</td>
                <td className={td}>{p.category}</td>
                <td className={td}><span className="badge">{p.is_published ? 'Terbit' : 'Draf'}</span></td>
                <td className={td}>{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
