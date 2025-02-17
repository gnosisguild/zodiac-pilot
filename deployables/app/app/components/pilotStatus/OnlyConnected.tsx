import { Info } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { useConnected } from './PilotStatusContext'

export const OnlyConnected = ({ children }: PropsWithChildren) => {
  const connected = useConnected()
  const [delayed, setDelayed] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDelayed(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  if (connected) {
    return children
  }

  if (delayed) {
    return null
  }

  return (
    <div className="max-w-1/2 mx-auto">
      <Info title="This feature requires the Pilot browser extension">
        To use this feature the Pilot browser extension must be installed and
        opened.
      </Info>
    </div>
  )
}
