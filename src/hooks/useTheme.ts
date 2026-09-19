import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', theme === 'dark' ? '#11141b' : '#c7ccd4',
    )
    try { localStorage.setItem('njen-theme', theme) } catch { /* Storage is optional. */ }
  }, [theme])

  return { theme, toggleTheme: () => setTheme(value => value === 'dark' ? 'light' : 'dark') }
}
