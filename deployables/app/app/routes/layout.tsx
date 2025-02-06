import { Navigation } from '@/components'
import { PilotMessageType, type Message } from '@zodiac/messages'
import { GhostButton, PilotType, ZodiacOsPlain } from '@zodiac/ui'
import {
  ArrowUpFromLine,
  Edit,
  Landmark,
  Plus,
  Power,
  PowerOff,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'

const Sidebar = () => {
  return (
    <div className="flex h-full flex-1">
      <div className="flex w-64 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950">
        <div className="my-12 flex items-center justify-center gap-2">
          <ZodiacOsPlain className="h-6" />
          <PilotType className="h-7 dark:invert" />
        </div>

        <div className="flex-1">
          <Navigation>
            <Navigation.Section title="Tokens">
              <Navigation.Link to="/tokens/send" icon={ArrowUpFromLine}>
                Send tokens
              </Navigation.Link>

              <Navigation.Link to="/tokens/balances" icon={Landmark}>
                Balances
              </Navigation.Link>
            </Navigation.Section>

            <Navigation.Section title="Routes">
              <Navigation.Link to="/new-route" icon={Plus}>
                Create new route
              </Navigation.Link>

              <Navigation.Link to="/edit-route" icon={Edit}>
                Edit a route
              </Navigation.Link>
            </Navigation.Section>
          </Navigation>
        </div>

        <div className="flex justify-center py-8">
          <PilotStatus />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default Sidebar

const PilotStatus = () => {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const handleMessage = (event: MessageEvent<Message>) => {
      if (event.data == null) {
        return
      }

      if (event.data.type !== PilotMessageType.PILOT_CONNECT) {
        return
      }

      setConnected(true)
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

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
