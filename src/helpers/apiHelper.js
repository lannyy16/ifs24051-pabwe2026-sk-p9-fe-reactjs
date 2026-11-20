const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/** Alamat backend dari VITE_API_BASE_URL (tanpa slash di akhir); kosong => proxy Vite. */
export const resolveBase = () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

/**
 * Wrapper fetch terpusat: menyuntikkan Bearer token dan mengurai respons standar
 * { status, message, data }. Melempar Error (dengan .status) jika gagal.
 */
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${resolveBase()}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    const err = new Error('Tidak dapat terhubung ke server')
    err.status = 0
    throw err
  }

  let json
  try {
    json = await res.json()
  } catch {
    json = { status: 'error', message: 'Respons server tidak valid' }
  }

  if (!res.ok || json.status !== 'success') {
    const err = new Error(json.message || 'Terjadi kesalahan')
    err.status = res.status
    throw err
  }
  return json
}
