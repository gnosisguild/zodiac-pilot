import { useEffect, useState } from 'react'

export const useIsDark = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const result = window.matchMedia('(prefers-color-scheme: dark)')

    const handleDarkChange = (result: MediaQueryListEvent) => {
      setDark(result.matches)
    }

    result.addEventListener('change', handleDarkChange)

    setDark(result.matches)

    return () => {
      result.removeEventListener('change', handleDarkChange)
    }
  }, [])

  return dark
}
