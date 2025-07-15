import { CompanionAppMessageType } from '@zodiac/messages'
import { GhostButton } from '@zodiac/ui'
import { PanelRightOpen, Power, PowerOff } from 'lucide-react'
import { useConnected } from './PilotStatusContext'

export const PilotStatus = () => {
  const connected = useConnected()

  const openPilot = () => {
    window.postMessage({ type: CompanionAppMessageType.OPEN_PILOT }, '*')
  }

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
    <div className="flex justify-between gap-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase">
        <PowerOff className="text-red-700" size={16} />
        Disconnected
      </div>

      <GhostButton
        iconOnly
        icon={PanelRightOpen}
        size="tiny"
        onClick={openPilot}
      >
        Open Pilot
      </GhostButton>
    </div>
  )
}
