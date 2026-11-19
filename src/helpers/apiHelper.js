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

/**
 * Menentukan alamat backend:
 * 1. VITE_API_BASE_URL (diisi saat build) bila ada;
 * 2. pada domain Delcom ...-fe-reactjs.* dipakai backend saudaranya ...-be-golang-gin.*;
 * 3. selain itu string kosong (proxy Vite saat development).
 */
export const resolveBase = (loc = window.location) => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) return configured.replace(/\/+$/, '')
  return loc.hostname.includes('-fe-reactjs')
    ? `${loc.protocol}//${loc.hostname.replace('-fe-reactjs', '-be-golang-gin')}`
    : ''
}

/**
 * Wrapper fetch terpusat: menyuntikkan Bearer token dan mengurai respons standar
 * { status, message, data }. Melempar Error (dengan .status) jika gagal.
 */
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const base = resolveBase()
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${base}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

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
