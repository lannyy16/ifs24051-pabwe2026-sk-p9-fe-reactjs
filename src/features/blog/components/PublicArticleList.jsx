import { useEffect, useState } from 'react'
import { IconClock, IconSearch } from '@tabler/icons-react'
import useInput from '../../../hooks/useInput'
import { getCategories, getPublicPosts } from '../api/blogApi'
import { formatDate } from '../../../helpers/toolsHelper'

/** Beranda: galeri artikel publik + pencarian real-time + filter kategori (pill). */
export default function PublicArticleList({ navigate }) {
  const [q, onQ] = useInput('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    getPublicPosts({ q, category })
      .then((data) => { if (active) { setPosts(data); setError('') } })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [q, category])

  const pill = (value, label) => (
    <button key={label} type="button" onClick={() => setCategory(value)}
      className={`rounded-full border px-3.5 py-1.5 text-sm cursor-pointer ${category === value
        ? 'border-accent bg-accent text-white'
        : 'border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700'}`}>
      {label}
    </button>
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <section className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Artikel Terbaru</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Bacaan pilihan dari para penulis Delcom Blog.</p>
      </section>

      <div className="relative mx-auto mb-4 max-w-xl">
        <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input aria-label="Cari artikel" placeholder="Cari artikel..." className="input pl-9" value={q} onChange={onQ} />
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {pill('', 'Semua')}
        {categories.map((c) => pill(c, c))}
      </div>

      {loading && <p className="text-center text-slate-600 dark:text-slate-400">Memuat artikel...</p>}
      {error && <p className="text-center text-rose-700 dark:text-rose-400">{error}</p>}
      {!loading && !error && posts.length === 0 && <p className="text-center text-slate-600 dark:text-slate-400">Belum ada artikel.</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <article key={p.id} className="card flex cursor-pointer flex-col overflow-hidden transition hover:shadow-md"
            onClick={() => navigate(`/posts/${p.slug}`)}>
            {p.cover_image_path && <img src={p.cover_image_path} alt={p.title} width="400" height="160" loading="lazy" className="h-40 w-full object-cover" />}
            <div className="flex flex-1 flex-col p-4">
              <span className="mb-2 w-fit rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">{p.category}</span>
              <h2 className="mb-1 text-lg font-semibold">
                <a href={`/posts/${p.slug}`} onClick={(e) => e.preventDefault()}>{p.title}</a>
              </h2>
              <p className="mb-3 flex-1 text-sm text-slate-600 dark:text-slate-400">{p.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{p.author.username} · {formatDate(p.published_at)}</span>
                <span className="flex items-center gap-1"><IconClock size={14} />{p.reading_time} mnt baca</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
