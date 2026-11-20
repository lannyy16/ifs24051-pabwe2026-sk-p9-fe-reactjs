import { lazy, Suspense, useEffect, useState } from 'react'
import { IconArrowLeft, IconCalendar, IconClock, IconUser } from '@tabler/icons-react'
import Link from '../../../components/Link'
import usePageMeta from '../../../hooks/usePageMeta'
import { getPublicPost } from '../api/blogApi'
import { formatDate } from '../../../helpers/toolsHelper'

const MarkdownViewer = lazy(() => import('../../../components/MarkdownViewer'))

/** Halaman baca artikel. */
export default function PublicArticleDetail({ slug }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  usePageMeta(
    post ? `${post.title} - Delcom Blog` : 'Artikel - Delcom Blog',
    post ? post.excerpt : 'Baca artikel lengkap di Delcom Blog.',
  )

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
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <Link to="/" className="btn-ghost mb-6">
        <IconArrowLeft size={16} aria-hidden="true" /> Kembali ke beranda
      </Link>
      {!post && <h1 className="sr-only">Detail artikel</h1>}
      {error && <p role="alert" className="rounded-xl bg-rose-100 p-4 font-medium text-rose-900 dark:bg-rose-950 dark:text-rose-100">{error}</p>}
      {!post && !error && <div role="status" className="skeleton h-96"><span className="sr-only">Memuat artikel...</span></div>}
      {post && (
        <article>
          <header className="hero-bg rounded-3xl p-8 text-white sm:p-12">
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">{post.category}</span>
            <h1 className="m-0 mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
            <p className="m-0 mt-3 text-lg text-white">{post.excerpt}</p>
            <p className="m-0 mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-white">
              <span className="inline-flex items-center gap-1.5"><IconUser size={16} aria-hidden="true" />{post.author.username}</span>
              <span className="inline-flex items-center gap-1.5"><IconCalendar size={16} aria-hidden="true" />{formatDate(post.published_at)}</span>
              <span className="inline-flex items-center gap-1.5"><IconClock size={16} aria-hidden="true" />{post.reading_time} menit baca</span>
            </p>
          </header>
          {post.cover_image_path && (
            <img src={post.cover_image_path} alt={post.title} width="1200" height="480" className="mt-6 max-h-[420px] w-full rounded-2xl object-cover" />
          )}
          <div className="card mt-6 p-6 sm:p-10">
            <Suspense fallback={<p role="status" className="muted">Memuat konten...</p>}>
              <MarkdownViewer content={post.content} />
            </Suspense>
          </div>
        </article>
      )}
    </main>
  )
}
