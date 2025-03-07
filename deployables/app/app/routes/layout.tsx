import { getAvailableChains } from '@/balances-server'
import {
  FakeBrowser,
  MinimumVersion,
  Navigation,
  PilotStatus,
  ProvidePilotStatus,
} from '@/components'
import { ProvideChains } from '@/routes-ui'
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import { GhostLinkButton, PilotType, ZodiacOsPlain } from '@zodiac/ui'
import { ArrowUpFromLine, Landmark, List, Plus, Signature } from 'lucide-react'
import { href, Outlet } from 'react-router'
import type { Route } from './+types/layout'

export const loader = async () => {
  return { chains: await getAvailableChains() }
}

const Sidebar = ({ loaderData: { chains } }: Route.ComponentProps) => {
  return (
    <FakeBrowser>
      <ProvideChains chains={chains}>
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
                      to={href('/edit')}
                      icon={List}
                      reloadDocument={(location) =>
                        location.pathname.startsWith('/tokens')
                      }
                    >
                      Accounts
                    </Navigation.Link>

                    <Navigation.Link
                      to={href('/create')}
                      icon={Plus}
                      reloadDocument={(location) =>
                        location.pathname.startsWith('/tokens')
                      }
                    >
                      New Account
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

            <div className="flex flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900">
              <Outlet />
            </div>
          </div>
        </ProvidePilotStatus>
      </ProvideChains>
    </FakeBrowser>
  )
}

export default Sidebar
