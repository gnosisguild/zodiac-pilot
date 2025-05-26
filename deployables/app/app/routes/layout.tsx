import { ProvideUser } from '@/auth-client'
import { authorizedLoader } from '@/auth-server'
import { getAvailableChains } from '@/balances-server'
import {
  FakeBrowser,
  Navigation,
  PilotStatus,
  ProvidePilotStatus,
} from '@/components'
import { ProvideChains } from '@/routes-ui'
import { getSignInUrl } from '@workos-inc/authkit-react-router'
import { dbClient, getActiveFeatures } from '@zodiac/db'
import { getAdminOrganizationId } from '@zodiac/env'
import {
  Divider,
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
  Shield,
  ShieldUser,
  Signature,
  User,
} from 'lucide-react'
import { href, NavLink, Outlet } from 'react-router'
import type { Route } from './+types/layout'

export const loader = async (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant, workOsOrganization, workOsUser, role },
      },
      request,
    }) => {
      const url = new URL(request.url)
      const routeFeatures = url.searchParams.getAll('feature')

      const chains = await getAvailableChains()

      if (tenant == null) {
        return {
          chains,
          user: null,
          role: null,
          features: routeFeatures,
          signInUrl: await getSignInUrl(url.pathname),
          isSystemAdmin: false,
        }
      }

      const db = dbClient()

      const features = await getActiveFeatures(db, tenant.id)

      return {
        chains,
        user: workOsUser,
        role,
        features: [...features.map(({ name }) => name), ...routeFeatures],
        signInUrl: await getSignInUrl(url.pathname),
        isSystemAdmin: getAdminOrganizationId() === workOsOrganization.id,
      }
    },
  )

const PageLayout = ({
  loaderData: { chains, user, features, signInUrl, role, isSystemAdmin },
}: Route.ComponentProps) => {
  return (
    <FakeBrowser>
      <ProvideUser user={user}>
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
                            to={href('/tokens/send')}
                            icon={ArrowUpFromLine}
                          >
                            Send Tokens
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

                        <Navigation.Section title="Safe Accounts">
                          <Navigation.Link
                            to={href('/edit')}
                            icon={List}
                            reloadDocument={(location) =>
                              location.pathname.startsWith('/tokens')
                            }
                          >
                            Safe Accounts
                          </Navigation.Link>

                          <Navigation.Link
                            to={href('/create')}
                            icon={Plus}
                            reloadDocument={(location) =>
                              location.pathname.startsWith('/tokens')
                            }
                          >
                            New Safe Account
                          </Navigation.Link>
                        </Navigation.Section>

                        <Navigation.Section title="Transactions">
                          <Navigation.Link
                            to={href('/submit')}
                            icon={Signature}
                          >
                            Sign a transaction
                          </Navigation.Link>
                        </Navigation.Section>

                        {role === 'admin' && (
                          <Navigation.Section title="Organization">
                            <Navigation.Link
                              to={href('/admin')}
                              icon={ShieldUser}
                            >
                              User Management
                            </Navigation.Link>
                          </Navigation.Section>
                        )}

                        {isSystemAdmin && (
                          <Navigation.Section title="System">
                            <Navigation.Link
                              to={href('/system-admin')}
                              icon={Shield}
                            >
                              System admin
                            </Navigation.Link>
                          </Navigation.Section>
                        )}
                      </Navigation>
                    </SidebarBody>

                    <SidebarFooter>
                      <div className="py-4">
                        <PilotStatus />
                      </div>

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
                    </SidebarFooter>
                  </Sidebar>
                }
              >
                <Outlet />
              </SidebarLayout>
            </ProvidePilotStatus>
          </ProvideChains>
        </FeatureProvider>
      </ProvideUser>
    </FakeBrowser>
  )
}

export default PageLayout
