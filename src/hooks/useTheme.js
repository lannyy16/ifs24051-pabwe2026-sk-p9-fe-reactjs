import { useCallback, useEffect, useState } from 'react'

export const ACCENTS = ['indigo', 'emerald', 'rose', 'amber']

const initialTheme = () =>
  localStorage.getItem('theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

/** Hook tema dark/light dan aksen warna (tersimpan di localStorage). */
export default function useTheme() {
  const [theme, setTheme] = useState(initialTheme)
  const [accent, setAccent] = useState(() => localStorage.getItem('accent') ?? 'indigo')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem('accent', accent)
  }, [accent])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return { theme, toggleTheme, accent, setAccent }
}
