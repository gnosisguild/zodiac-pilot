import { useEffect, useState } from 'react'
import { useExtensionVersion } from '../versionManagement/ExtensionVersionContext'

export const useIsExtensionInstalled = () => {
  const version = useExtensionVersion()
  const [hasWaited, setHasWaited] = useState(false)

  // return undefined during the first 500ms to avoid flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasWaited(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // On server side, always return undefined
  if (typeof window === 'undefined') {
    return undefined
  }

  if (version != null) {
    return true
  }

  return hasWaited ? false : undefined
}
