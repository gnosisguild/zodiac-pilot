import { getAvailableChains } from '@/balances-server'
import { MinimumVersion, OnlyConnected, Page } from '@/components'
import { useIsPending } from '@/hooks'
import { Chain, ProvideChains } from '@/routes-ui'
import { CHAIN_NAME, getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { getString } from '@zodiac/form-data'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import { Address, Form, GhostButton, Info, Table } from '@zodiac/ui'
import classNames from 'classnames'
import { Pencil } from 'lucide-react'
import { type PropsWithChildren } from 'react'
import { href, redirect } from 'react-router'
import type { Route } from './+types/list-routes'

export const loader = async () => ({ chains: await getAvailableChains() })

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const { promise, resolve } = Promise.withResolvers<ExecutionRoute[]>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTES,
    },
    (response) => resolve(response.routes),
  )

  const [serverData, routes] = await Promise.all([serverLoader(), promise])

  return { ...serverData, routes }
}

clientLoader.hydrate = true as const

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const data = await request.formData()
  const { promise, resolve } = Promise.withResolvers<string>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTE,
      routeId: getString(data, 'routeId'),
    },
    (response) =>
      resolve(href('/edit/:data', { data: encode(response.route) })),
  )

  return redirect(await promise)
}

const ListRoutes = ({
  loaderData: { chains, ...loaderData },
}: Route.ComponentProps) => (
  <ProvideChains chains={chains}>
    <Page fullWidth>
      <Page.Header>Accounts</Page.Header>

      <Page.Main>
        <MinimumVersion
          version="3.4.0"
          fallback={
            <Info>
              To edit a route open the list of all routes in the Pilot extension
              and click "Edit".
            </Info>
          }
        >
          <OnlyConnected>
            {'routes' in loaderData && (
              <Routes>
                {loaderData.routes.map((route) => (
                  <Route key={route.id} route={route} />
                ))}
              </Routes>
            )}
          </OnlyConnected>
        </MinimumVersion>
      </Page.Main>
    </Page>
  </ProvideChains>
)

export default ListRoutes

const Routes = ({ children }: PropsWithChildren) => {
  return (
    <Table>
      <Table.THead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Chain</Table.Th>
          <Table.Th>Initiator</Table.Th>
          <Table.Th>Account</Table.Th>
          <Table.Th className="w-1/10" />
        </Table.Tr>
      </Table.THead>

      <Table.TBody>{children}</Table.TBody>
    </Table>
  )
}

type RouteProps = { route: ExecutionRoute }

const Route = ({ route }: RouteProps) => {
  const chainId = getChainId(route.avatar)

  return (
    <Table.Tr>
      <Table.Td>{route.label}</Table.Td>
      <Table.Td>
        <Chain chainId={chainId}>{CHAIN_NAME[chainId]}</Chain>
      </Table.Td>
      <Table.Td>
        {route.initiator == null ? (
          <Address>{ZERO_ADDRESS}</Address>
        ) : (
          <Address shorten>{route.initiator}</Address>
        )}
      </Table.Td>
      <Table.Td>
        <Address shorten>{route.avatar}</Address>
      </Table.Td>
      <Table.Td align="right">
        <Edit routeId={route.id} />
      </Table.Td>
    </Table.Tr>
  )
}

const Edit = ({ routeId }: { routeId: string }) => {
  const submitting = useIsPending((data) => data.get('routeId') === routeId)

  return (
    <div
      className={classNames(
        'flex justify-center transition-opacity group-hover:opacity-100',
        submitting ? 'opacity-100' : 'opacity-0',
      )}
    >
      <Form>
        <GhostButton
          submit
          size="tiny"
          name="routeId"
          icon={Pencil}
          value={routeId}
          busy={submitting}
        >
          Edit
        </GhostButton>
      </Form>
    </div>
  )
}
