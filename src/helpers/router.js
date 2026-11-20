const PAGES = { login: 'login', register: 'register', author: 'author', dashboard: 'author', admin: 'admin' }

/** Pindah halaman tanpa reload; App mendengarkan event popstate. */
export function navigate(path, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({}, '', path)
  } else {
    window.history.pushState({}, '', path)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

/** Memetakan pathname ke nama halaman. */
export function matchRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/public' || path === '/posts') return { name: 'home' }
  if (path === '/posts/create') return { name: 'author', create: true }
  const post = path.match(/^\/posts\/([^/]+)$/)
  if (post) return { name: 'post', slug: decodeURIComponent(post[1]) }
  const page = PAGES[path.slice(1)]
  return page ? { name: page } : { name: 'notfound' }
}

export const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/dashboard')

/** Mengembalikan path tujuan redirect (atau null) menurut sesi pengguna. */
export function getRedirect(name, user) {
  if (name === 'login' || name === 'register') return user ? homeFor(user) : null
  if (name === 'author') return user ? null : '/login'
  if (name === 'admin') {
    if (!user) return '/login'
    return user.role === 'admin' ? null : '/dashboard'
  }
  return null
}
