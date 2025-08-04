import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, findDefaultRoute, getRoutes } from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import { SecondaryLinkButton, TabBar } from '@zodiac/ui'
import { Plus } from 'lucide-react'
import { href, Outlet, useOutletContext } from 'react-router'
import type { Route } from './+types/routes-layout'
import { RouteTab } from './RouteTab'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { accountId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const [routes, defaultRoute] = await Promise.all([
        getRoutes(dbClient(), tenant.id, {
          userId: user.id,
          accountId,
        }),
        findDefaultRoute(dbClient(), tenant, user, accountId),
      ])

      return {
        routes,
        defaultRouteId: defaultRoute == null ? null : defaultRoute.routeId,
      }
    },
    { ensureSignedIn: true },
  )

const RoutesLayout = ({
  loaderData: { routes, defaultRouteId },
  params: { workspaceId, accountId, routeId },
}: Route.ComponentProps) => {
  const { formId } = useOutletContext<{ formId: string }>()

  return (
    <>
      {routes.length > 0 && (
        <TabBar
          action={
            <div className="py-2">
              <SecondaryLinkButton
                replace
                icon={Plus}
                size="small"
                to={
                  routeId == null
                    ? href(
                        '/workspace/:workspaceId/accounts/:accountId/no-routes/add',
                        { workspaceId, accountId },
                      )
                    : href(
                        '/workspace/:workspaceId/accounts/:accountId/route/:routeId/add',
                        {
                          workspaceId,
                          accountId,
                          routeId,
                        },
                      )
                }
              >
                Add route
              </SecondaryLinkButton>
            </div>
          }
        >
          {routes.map((route) => (
            <RouteTab
              key={route.id}
              route={route}
              isDefault={defaultRouteId != null && route.id === defaultRouteId}
            />
          ))}
        </TabBar>
      )}

      <Outlet context={{ formId }} />
    </>
  )
}

export default RoutesLayout
