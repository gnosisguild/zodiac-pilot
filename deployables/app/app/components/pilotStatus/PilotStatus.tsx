import { GhostButton } from '@zodiac/ui'
import { Power, PowerOff } from 'lucide-react'
import { useState } from 'react'
import { useConnectChangeOnPilotEvents } from './useConnectChangeOnPilotEvents'
import { useDisconnectWhenUnreachable } from './useDisconnectWhenUnreachable'
import { usePingWhileDisconnected } from './usePingWhileDisconnected'

export const PilotStatus = () => {
  const connected = useConnected()

  if (connected) {
    return (
      <div className="flex flex-col gap-2">
        <div className="leading-0 flex items-center gap-2 text-xs font-semibold uppercase">
          <Power className="text-green-500" size={16} />
          Connected
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase">
        <PowerOff className="text-red-700" size={16} />
        Disconnected
      </div>

      <GhostButton id="ZODIAC-PILOT::open-panel-button" size="tiny">
        Open Pilot
      </GhostButton>
    </div>
  )
}

const useConnected = () => {
  const [connected, setConnected] = useState(false)

  useConnectChangeOnPilotEvents({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
  })
  usePingWhileDisconnected(connected, { onConnect: () => setConnected(true) })
  useDisconnectWhenUnreachable(connected, {
    onDisconnect: () => setConnected(false),
  })

  return connected
}
