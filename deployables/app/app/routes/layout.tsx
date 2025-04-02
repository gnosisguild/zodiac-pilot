import { getAvailableChains } from '@/balances-server'
import {
  FakeBrowser,
  Navigation,
  PilotStatus,
  ProvidePilotStatus,
} from '@/components'
import { dbClient, getFeatures, getTenant } from '@/db'
import { ProvideChains } from '@/routes-ui'
import { getOrganizationForUser } from '@/workOS/server'
import {
  authkitLoader,
  getSignInUrl,
  signOut,
} from '@workos-inc/authkit-react-router'
import {
  Divider,
  Feature,
  FeatureProvider,
  GhostLinkButton,
  PilotType,
  PrimaryLinkButton,
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
  authkitLoader(args, async ({ auth: { user }, request }) => {
    const url = new URL(request.url)
    const routeFeatures = url.searchParams.getAll('feature')

    if (user == null) {
      return {
        chains: await getAvailableChains(),
        features: routeFeatures,
        signInUrl: await getSignInUrl(),
      }
    }

    const db = dbClient()

    const organization = await getOrganizationForUser(user.id)

    try {
      const tenant = await getTenant(db, organization.externalId)

      const features = await getFeatures(db, tenant.id)

      return {
        chains: await getAvailableChains(),
        features: [...features.map(({ name }) => name), ...routeFeatures],
        signInUrl: await getSignInUrl(),
      }
    } catch {
      throw await signOut(request)
    }
  })

const PageLayout = ({
  loaderData: { chains, user, features, signInUrl },
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
                    <div className="py-4">
                      <PilotStatus />
                    </div>

                    <Feature feature="user-management">
                      <div className="flex flex-col gap-4">
                        <Divider />

                        {user ? (
                          <NavLink
                            to={href('/profile')}
                            className="group flex items-center gap-x-2 text-sm/6 font-semibold text-zinc-950 dark:text-white"
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
                        ) : (
                          <div className="flex gap-2">
                            <GhostLinkButton
                              fluid
                              to={href('/sign-up')}
                              size="small"
                            >
                              Sign Up
                            </GhostLinkButton>

                            <PrimaryLinkButton
                              fluid
                              to={signInUrl}
                              size="small"
                            >
                              Sign In
                            </PrimaryLinkButton>
                          </div>
                        )}
                      </div>
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
