import { useEffect, useState } from 'react'

export const useActiveWhenVisible = () => {
  const [active, setActive] = useState(document.visibilityState === 'visible')

  useEffect(() => {
    const handleVisibilityChange = () =>
      setActive(document.visibilityState === 'visible')

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return active
}
