import { getAvailableChains } from '@/balances-server'
import {
  FakeBrowser,
  Navigation,
  PilotStatus,
  ProvidePilotStatus,
} from '@/components'
import { dbClient, getFeatures, getTenant } from '@/db'
import { Feature, FeatureProvider } from '@/features'
import { ProvideChains } from '@/routes-ui'
import { getOrganizationForUser } from '@/workOS'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import {
  PilotType,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarLayout,
  ZodiacOsPlain,
} from '@zodiac/ui'
import {
  ArrowUpFromLine,
  Landmark,
  List,
  Plus,
  Signature,
  User,
} from 'lucide-react'
import { href, NavLink, Outlet } from 'react-router'
import type { Route } from './+types/layout'

export const loader = async (args: Route.LoaderArgs) =>
  authkitLoader(args, async ({ auth: { user } }) => {
    if (user == null) {
      return {
        chains: await getAvailableChains(),
        features: [],
      }
    }

    const db = dbClient()

    const organization = await getOrganizationForUser(user.id)
    const tenant = await getTenant(db, organization.externalId)

    return {
      chains: await getAvailableChains(),
      features: (await getFeatures(db, tenant.id)).map(({ name }) => name),
    }
  })

const PageLayout = ({
  loaderData: { chains, user, features },
}: Route.ComponentProps) => {
  return (
    <FakeBrowser>
      <FeatureProvider features={features}>
        <ProvideChains chains={chains}>
          <ProvidePilotStatus>
            <SidebarLayout
              navbar={null}
              sidebar={
                <Sidebar>
                  <SidebarHeader>
                    <div className="my-8 flex items-center justify-center gap-2">
                      <ZodiacOsPlain className="h-6" />
                      <PilotType className="h-7 dark:invert" />
                    </div>
                  </SidebarHeader>

                  <SidebarBody>
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
                  </SidebarBody>

                  <SidebarFooter>
                    <div className="flex justify-center py-8">
                      <PilotStatus />
                    </div>

                    <Feature feature="user-management">
                      {user && (
                        <NavLink
                          to={href('/profile')}
                          className="group flex items-center gap-x-2 px-6 text-sm/6 font-semibold text-zinc-950 dark:text-white"
                        >
                          {user.profilePictureUrl ? (
                            <img
                              alt=""
                              src={user.profilePictureUrl}
                              className="size-8 rounded-full bg-zinc-800"
                            />
                          ) : (
                            <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-white">
                              <User size={16} />
                            </div>
                          )}
                          <span className="sr-only">Your profile</span>
                          <span
                            aria-hidden="true"
                            className="flex-1 rounded px-4 py-2 group-hover:bg-zinc-950/5 group-hover:dark:bg-white/5"
                          >
                            {user.firstName} {user.lastName}
                          </span>
                        </NavLink>
                      )}
                    </Feature>
                  </SidebarFooter>
                </Sidebar>
              }
            >
              <Outlet />
            </SidebarLayout>
          </ProvidePilotStatus>
        </ProvideChains>
      </FeatureProvider>
    </FakeBrowser>
  )
}

export default PageLayout
