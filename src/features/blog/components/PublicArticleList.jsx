import { useEffect, useState } from 'react'
import { IconClock, IconSearch, IconArticleOff } from '@tabler/icons-react'
import Link from '../../../components/Link'
import usePageMeta from '../../../hooks/usePageMeta'
import useInput from '../../../hooks/useInput'
import { getPublicPosts } from '../api/blogApi'
import { CATEGORIES } from '../constants'
import { formatDate } from '../../../helpers/toolsHelper'

const ALL = 'Semua'
const FILTERS = [ALL, ...CATEGORIES]

function PostCard({ post }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      {post.cover_image_path ? (
        <img src={post.cover_image_path} alt="" width="640" height="320" loading="lazy" className="h-44 w-full object-cover" />
      ) : (
        <div className="cover-bg grid h-44 place-items-center text-5xl font-black text-white" aria-hidden="true">
          {post.title.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="badge">{post.category}</span>
        <h2 className="m-0 text-lg font-bold leading-snug">
          <Link to={`/posts/${post.slug}`} className="text-slate-900 after:absolute after:inset-0 hover:underline dark:text-white">
            {post.title}
          </Link>
        </h2>
        <p className="m-0 flex-1 text-sm muted">{post.excerpt}</p>
        <p className="m-0 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs muted">
          <span className="font-semibold text-slate-800 dark:text-slate-100">{post.author.username}</span>
          <span>{formatDate(post.published_at)}</span>
          <span className="inline-flex items-center gap-1"><IconClock size={14} aria-hidden="true" />{post.reading_time} menit baca</span>
        </p>
      </div>
    </article>
  )
}

/** Beranda: hero, pencarian real-time, filter kategori (pill), dan galeri artikel. */
export default function PublicArticleList() {
  usePageMeta('Delcom Blog - Artikel Teknologi, Pendidikan, dan Lainnya', 'Baca artikel terbaru di Delcom Blog. Cari berdasarkan kata kunci atau filter kategori.')
  const [q, onQ] = useInput('')
  const [category, setCategory] = useState(ALL)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    getPublicPosts({ q, category: category === ALL ? '' : category })
      .then((data) => { if (active) { setPosts(data); setError('') } })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [q, category])

  return (
    <main>
      <section className="hero-bg text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:py-20">
          <h1 className="m-0 text-4xl font-extrabold tracking-tight sm:text-5xl">Ide, cerita, dan pengetahuan</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white">
            Baca artikel pilihan dari para penulis Delcom Blog, atau tulis dan terbitkan gagasanmu sendiri dengan bantuan AI.
          </p>
          <div className="relative mx-auto mt-8 max-w-xl text-left">
            <label htmlFor="search-input" className="sr-only">Cari artikel</label>
            <IconSearch size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden="true" />
            <input
              id="search-input"
              type="search"
              value={q}
              onChange={onQ}
              placeholder="Cari artikel..."
              className="input !rounded-2xl !border-transparent !py-3.5 !pl-12 !text-base !text-slate-900 !shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div role="group" aria-label="Filter kategori" className="mb-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold cursor-pointer transition ${
                category === name
                  ? 'border-accent bg-accent text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <section aria-label="Daftar artikel" className="min-h-[24rem]">
          {loading && (
            <>
              <p role="status" className="sr-only">Memuat artikel...</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                {[0, 1, 2].map((i) => <div key={i} className="skeleton h-80" />)}
              </div>
            </>
          )}
          {!loading && error && (
            <p role="alert" className="mx-auto max-w-xl rounded-xl bg-rose-100 p-4 text-center font-medium text-rose-900 dark:bg-rose-950 dark:text-rose-100">
              {error}
            </p>
          )}
          {!loading && !error && posts.length === 0 && (
            <div className="grid place-items-center gap-2 py-16 text-center">
              <IconArticleOff size={48} className="text-slate-500" aria-hidden="true" />
              <p className="m-0 text-lg font-semibold">Belum ada artikel yang cocok.</p>
              <p className="m-0 muted">Coba kata kunci atau kategori lain.</p>
            </div>
          )}
          {!loading && !error && posts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
