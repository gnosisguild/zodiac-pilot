import { useEffect, useState } from 'react'

export const useActiveWhenVisible = () => {
  const [active, setActive] = useState(() => {
    if (typeof document === 'undefined') {
      return false
    }

    return document.visibilityState === 'visible'
  })

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const handleVisibilityChange = () =>
      setActive(document.visibilityState === 'visible')

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return active
}
