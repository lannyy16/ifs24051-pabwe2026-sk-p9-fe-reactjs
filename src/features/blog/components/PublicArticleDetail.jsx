import { lazy, Suspense, useEffect, useState } from 'react'
import { IconArrowLeft, IconClock } from '@tabler/icons-react'
import { getPublicPost } from '../api/blogApi'
const MarkdownViewer = lazy(() => import('../../../components/MarkdownViewer'))
import { formatDate } from '../../../helpers/toolsHelper'

/** Halaman baca artikel (full width). */
export default function PublicArticleDetail({ slug, navigate }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setPost(null)
    setError('')
    getPublicPost(slug)
      .then((data) => { if (active) setPost(data) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [slug])

  return (
    <main className="mx-auto w-full max-w-[96vw] py-8">
      <button type="button" className="btn-ghost mb-4" onClick={() => navigate('/')}>
        <IconArrowLeft size={16} /> Kembali
      </button>
      {!post && <h1 className="sr-only">Detail artikel</h1>}
      {error && <p className="text-rose-700 dark:text-rose-400">{error}</p>}
      {!post && !error && <p className="text-slate-600 dark:text-slate-300">Memuat artikel...</p>}
      {post && (
        <article className="card p-6 md:p-10">
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-ink">{post.category}</span>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">{post.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 text-sm text-slate-600 dark:text-slate-300">
            <span>Oleh {post.author.username}</span>
            <span>{formatDate(post.published_at)}</span>
            <span className="flex items-center gap-1"><IconClock size={14} />{post.reading_time} menit baca</span>
          </p>
          {post.cover_image_path && (
            <img src={post.cover_image_path} alt={post.title} className="my-6 max-h-[420px] w-full rounded-xl object-cover" />
          )}
          <div className="mt-6">
            <Suspense fallback={<p className="text-slate-600 dark:text-slate-300">Memuat konten...</p>}>
              <MarkdownViewer content={post.content} />
            </Suspense>
          </div>
        </article>
      )}
    </main>
  )
}
