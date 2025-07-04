import { ProvideUser } from '@/auth-client'
import { authorizedLoader } from '@/auth-server'
import { getAvailableChains } from '@/balances-server'
import { Navigation, PilotStatus, ProvidePilotStatus } from '@/components'
import { ProvideChains } from '@/routes-ui'
import { ProvideWorkspace } from '@/workspaces'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getActiveFeatures,
  getLastAccountsUpdateTime,
  getLastRoutesUpdateTime,
  getWorkspace,
} from '@zodiac/db'
import { getAdminOrganizationId } from '@zodiac/env'
import { isUUID } from '@zodiac/schema'
import {
  Divider,
  FeatureProvider,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarLayout,
  ZodiacOsLogo,
} from '@zodiac/ui'
import {
  ArrowRightLeft,
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
import type { Route } from './+types/workspace-layout'

export const loader = async (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant, workOsOrganization, user, role },
      },
      params: { workspaceId },
      request,
    }) => {
      invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

      const url = new URL(request.url)
      const routeFeatures = url.searchParams.getAll('feature')

      const chains = await getAvailableChains()

      const db = dbClient()

      const [features, lastAccountsUpdate, lastRoutesUpdate, workspace] =
        await Promise.all([
          getActiveFeatures(db, tenant.id),
          getLastAccountsUpdateTime(db, tenant.id),
          getLastRoutesUpdateTime(db, tenant.id),
          getWorkspace(db, workspaceId),
        ])

      return {
        chains,
        user,
        role,
        workspace,
        features: [...features.map(({ name }) => name), ...routeFeatures],
        isSystemAdmin: getAdminOrganizationId() === workOsOrganization.id,
        lastAccountsUpdate,
        lastRoutesUpdate,
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { workspaceId } }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

        const workspace = await getWorkspace(dbClient(), workspaceId)

        return workspace.tenantId === tenant.id
      },
    },
  )

const PageLayout = ({
  loaderData: {
    chains,
    user,
    features,
    role,
    isSystemAdmin,
    lastAccountsUpdate,
    lastRoutesUpdate,
    workspace,
  },
  params: { workspaceId },
}: Route.ComponentProps) => {
  return (
    <ProvideWorkspace workspace={workspace}>
      <ProvideUser user={user}>
        <FeatureProvider features={features}>
          <ProvideChains chains={chains}>
            <ProvidePilotStatus
              lastAccountsUpdate={lastAccountsUpdate}
              lastRoutesUpdate={lastRoutesUpdate}
            >
              <SidebarLayout
                navbar={null}
                sidebar={
                  <Sidebar>
                    <SidebarHeader>
                      <div className="my-8 flex items-center justify-center gap-2">
                        <ZodiacOsLogo className="h-6" />
                      </div>
                    </SidebarHeader>

                    <SidebarBody>
                      <Navigation>
                        <Navigation.Section title="Tokens">
                          <Navigation.Link
                            reloadDocument={(location) =>
                              !location.pathname.startsWith('/tokens')
                            }
                            to={href(
                              '/workspace/:workspaceId/tokens/send/:chain?/:token?',
                              { workspaceId },
                            )}
                            icon={ArrowUpFromLine}
                          >
                            Send Tokens
                          </Navigation.Link>

                          <Navigation.Link
                            reloadDocument={(location) =>
                              !location.pathname.startsWith('/tokens')
                            }
                            to={href(
                              '/workspace/:workspaceId/tokens/balances',
                              {
                                workspaceId,
                              },
                            )}
                            icon={Landmark}
                          >
                            Balances
                          </Navigation.Link>

                          <Navigation.Link
                            reloadDocument={(location) =>
                              !location.pathname.startsWith('/tokens')
                            }
                            to={href('/workspace/:workspaceId/tokens/swap', {
                              workspaceId,
                            })}
                            icon={ArrowRightLeft}
                          >
                            Swap
                          </Navigation.Link>
                        </Navigation.Section>

                        <Navigation.Section title="Safe Accounts">
                          <Navigation.Link
                            to={href('/workspace/:workspaceId/accounts', {
                              workspaceId,
                            })}
                            icon={List}
                            reloadDocument={(location) =>
                              location.pathname.startsWith('/tokens')
                            }
                          >
                            Safe Accounts
                          </Navigation.Link>

                          <Navigation.Link
                            to={href('/workspace/:workspaceId/local-accounts', {
                              workspaceId,
                            })}
                            icon={List}
                            reloadDocument={(location) =>
                              location.pathname.startsWith('/tokens')
                            }
                          >
                            Local Safe Accounts
                          </Navigation.Link>

                          <Navigation.Link
                            to={href(
                              '/workspace/:workspaceId/accounts/create/:prefixedAddress?',
                              { workspaceId },
                            )}
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
                            to={href('/workspace/:workspaceId/submit', {
                              workspaceId,
                            })}
                            icon={Signature}
                          >
                            Sign a transaction
                          </Navigation.Link>
                        </Navigation.Section>

                        {role === 'admin' && (
                          <Navigation.Section title="Organization">
                            <Navigation.Link
                              to={href('/workspace/:workspaceId/admin', {
                                workspaceId,
                              })}
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

                        <NavLink
                          to={href('/workspace/:workspaceId/profile', {
                            workspaceId,
                          })}
                          className="group flex items-center gap-x-2 text-sm/6 font-semibold text-zinc-950 dark:text-white"
                        >
                          <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-white">
                            <User size={16} />
                          </div>

                          <span className="sr-only">Your profile</span>
                          <span
                            aria-hidden="true"
                            className="flex-1 rounded px-4 py-2 group-hover:bg-zinc-950/5 group-hover:dark:bg-white/5"
                          >
                            {user.fullName}
                          </span>
                        </NavLink>
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
    </ProvideWorkspace>
  )
}

export default PageLayout
