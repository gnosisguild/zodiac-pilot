import { Info } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import { useConnected } from './PilotStatusContext'

export const OnlyConnected = ({ children }: PropsWithChildren) => {
  const connected = useConnected()

  if (connected) {
    return children
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
