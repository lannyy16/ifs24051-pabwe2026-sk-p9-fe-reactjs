import { useCallback, useEffect, useState } from 'react'
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi'
import { formatDate, showError } from '../../../helpers/toolsHelper'

/** Panel admin (full width): monitoring pengguna & seluruh artikel. */
export default function AdminDashboard() {
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
    <div className="mx-auto w-full max-w-[96vw] space-y-6 py-8">
      <h1 className="text-2xl font-bold">Panel Administrasi</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {[['Total Pengguna', users.length], ['Total Artikel', totalPosts], ['Total Terbit', totalPublished]].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-bold text-accent">{value}</p>
          </div>
        ))}
      </div>

      <section className="card overflow-x-auto">
        <h2 className="px-4 pt-4 text-lg font-semibold">Direktori Pengguna</h2>
        <table className="mt-2 w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3">ID</th><th className="px-4 py-3">Username</th><th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th><th className="px-4 py-3">Artikel</th><th className="px-4 py-3">Terbit</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3">{u.id}</td><td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">{u.email}</td><td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.total_posts}</td><td className="px-4 py-3">{u.total_published}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="btn-ghost" onClick={() => showUserPosts(u)}>Lihat Artikel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card overflow-x-auto">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-lg font-semibold">{selected ? `Artikel milik ${selected.username}` : 'Seluruh Artikel'}</h2>
          {selected && <button type="button" className="btn-ghost" onClick={loadAll}>Tampilkan Semua</button>}
        </div>
        <table className="mt-2 w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3">Judul</th><th className="px-4 py-3">Penulis</th><th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-600 dark:text-slate-400">Tidak ada artikel.</td></tr>}
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-medium">{p.title}</td><td className="px-4 py-3">{p.author.username}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">{p.is_published ? 'Terbit' : 'Draf'}</td>
                <td className="px-4 py-3">{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
