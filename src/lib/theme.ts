import { useState } from 'react'

export type Theme = 'light' | 'dark'

// Same key the inline script in index.html reads, so a saved choice applies before first paint.
const KEY = 'hostit-theme'

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode: the choice just won't persist */
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current)
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    apply(next)
    setTheme(next)
  }
  return { theme, toggle }
}
