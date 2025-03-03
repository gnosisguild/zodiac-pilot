import {
  MinimumVersion,
  Navigation,
  PilotStatus,
  ProvidePilotStatus,
} from '@/components'
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import { GhostLinkButton, PilotType, ZodiacOsPlain } from '@zodiac/ui'
import { ArrowUpFromLine, Landmark, List, Plus, Signature } from 'lucide-react'
import { href, Outlet } from 'react-router'

const Sidebar = () => {
  return (
    <ProvidePilotStatus>
      <div className="flex h-full flex-1">
        <div className="flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800/80">
          <div className="my-12 flex items-center justify-center gap-2">
            <ZodiacOsPlain className="h-6" />
            <PilotType className="h-7 dark:invert" />
          </div>

          <div className="flex-1">
            <Navigation>
              <Navigation.Section title="Tokens">
                <Navigation.Link
                  reloadDocument={(location) =>
                    !location.pathname.startsWith('/tokens')
                  }
                  to={href('/tokens/send/:chain?/:token?')}
                  icon={ArrowUpFromLine}
                >
                  Send tokens
                </Navigation.Link>

                <Navigation.Link
                  reloadDocument={(location) =>
                    !location.pathname.startsWith('/tokens')
                  }
                  to={href('/tokens/balances')}
                  icon={Landmark}
                >
                  Balances
                </Navigation.Link>
              </Navigation.Section>

              <Navigation.Section title="Accounts">
                <Navigation.Link
                  to={href('/create')}
                  icon={Plus}
                  reloadDocument={(location) =>
                    location.pathname.startsWith('/tokens')
                  }
                >
                  Create new account
                </Navigation.Link>

                <Navigation.Link
                  to={href('/edit')}
                  icon={List}
                  reloadDocument={(location) =>
                    location.pathname.startsWith('/tokens')
                  }
                >
                  Manage accounts
                </Navigation.Link>
              </Navigation.Section>

              <Navigation.Section title="Transactions">
                <Navigation.Link to={href('/submit')} icon={Signature}>
                  Sign a transaction
                </Navigation.Link>
              </Navigation.Section>
            </Navigation>
          </div>

          <MinimumVersion version="3.3.2">
            <div className="flex justify-center py-8">
              <PilotStatus />
            </div>
          </MinimumVersion>

          <aside className="flex justify-center p-2">
            <GhostLinkButton
              openInNewWindow
              iconOnly
              icon={SiDiscord}
              to="https://discord.com/channels/881881751369175040/884777203332710460"
            >
              Open Discord
            </GhostLinkButton>

            <GhostLinkButton
              openInNewWindow
              iconOnly
              icon={SiGithub}
              to="https://github.com/gnosis/zodiac-pilot"
            >
              View on GitHub
            </GhostLinkButton>
          </aside>
        </div>

        <div className="bg-radial-[at_100%_100%] flex flex-1 flex-col overflow-hidden from-white to-zinc-50 dark:from-gray-900 dark:to-zinc-950">
          <Outlet />
        </div>
      </div>
    </ProvidePilotStatus>
  )
}

export default Sidebar
