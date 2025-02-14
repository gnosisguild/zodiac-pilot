import {
  MinimumVersion,
  Navigation,
  PilotStatus,
  ProvidePilotStatus,
  useIsDev,
} from '@/components'
import { PilotType, ZodiacOsPlain } from '@zodiac/ui'
import { ArrowUpFromLine, Edit, Landmark, Plus } from 'lucide-react'
import { Outlet } from 'react-router'

const Sidebar = () => {
  return (
    <ProvidePilotStatus>
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

                {useIsDev() && (
                  <Navigation.Link to="/create" icon={Plus}>
                    Create new account
                  </Navigation.Link>
                )}

                <Navigation.Link to="/edit-route" icon={Edit}>
                  Edit a route
                </Navigation.Link>
              </Navigation.Section>
            </Navigation>
          </div>

          <MinimumVersion version="3.3.2">
            <div className="flex justify-center py-8">
              <PilotStatus />
            </div>
          </MinimumVersion>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </ProvidePilotStatus>
  )
}

export default Sidebar
