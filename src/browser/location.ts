import { useEffect, useState } from 'react'

export const updateLocation = (url: string) => {
  window.location.hash = encodeURIComponent(url)
}

const decodeLocationHash = () => {
  const { hash } = window.location
  if (hash[0] === '#' && hash.length > 1) {
    return decodeURIComponent(hash.substring(1))
  }
  return ''
}

export const useLocation = () => {
  const [loc, setLoc] = useState(decodeLocationHash())
  useEffect(() => {
    const onChangeHash = () => setLoc(decodeLocationHash())
    window.addEventListener('hashchange', onChangeHash, false)

    return () => {
      window.removeEventListener('hashchange', onChangeHash, false)
    }
  })
  return loc
}
