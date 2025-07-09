import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { ChainSelect, getRouteId } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getAccount,
  getOrCreateWallet,
  getRoute,
  updateAccount,
  updateRoutePath,
} from '@zodiac/db'
import type { Account } from '@zodiac/db/schema'
import {
  getHexString,
  getOptionalString,
  getOptionalUUID,
  getString,
} from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import {
  createEoaStartingPoint,
  createOwnsConnection,
  createSafeWaypoint,
  queryRoutes,
} from '@zodiac/modules'
import { isUUID, type HexAddress, type Waypoints } from '@zodiac/schema'
import {
  AddressInput,
  FormLayout,
  GhostLinkButton,
  InlineForm,
  PrimaryButton,
  TextInput,
} from '@zodiac/ui'
import { useId } from 'react'
import { href, Outlet, redirect } from 'react-router'
import { prefixAddress } from 'ser-kit'
import type { Route } from './+types/edit'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { accountId } }) => {
      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const account = await getAccount(dbClient(), accountId)

      return {
        label: account.label || '',
        account: account.address,
        chainId: account.chainId,
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { accountId } }) {
        invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { accountId, workspaceId },
      context: {
        auth: { user },
      },
    }) => {
      const data = await request.formData()

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      await dbClient().transaction(async (tx) => {
        await updateAccount(tx, accountId, {
          label: getString(data, 'label'),
        })

        const routeId = getOptionalUUID(data, 'routeId')

        if (routeId == null) {
          return
        }

        const initiator = getHexString(data, 'initiator')
        const selectedRouteId = getOptionalString(data, 'serRouteId')

        const account = await getAccount(tx, accountId)
        const waypoints = await getWaypoints(
          initiator,
          account,
          selectedRouteId,
        )

        const route = await getRoute(tx, routeId)

        const wallet = await getOrCreateWallet(tx, user, {
          address: initiator,
          label: 'Unnamed wallet',
        })

        if (
          route.fromId !== wallet.id ||
          getRouteId(route.waypoints) !== selectedRouteId
        ) {
          await updateRoutePath(tx, route.id, {
            walletId: wallet.id,
            waypoints,
          })
        }
      })

      return redirect(href('/workspace/:workspaceId/accounts', { workspaceId }))
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { accountId } }) {
        invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )

const EditAccount = ({
  loaderData: { label, account, chainId },
  params: { workspaceId },
}: Route.ComponentProps) => {
  const formId = useId()

  return (
    <Page>
      <Page.Header>Edit Account</Page.Header>
      <Page.Main>
        <FormLayout>
          <TextInput
            form={formId}
            label="Label"
            name="label"
            defaultValue={label}
          />

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
              <ChainSelect disabled value={chainId} />
            </div>

            <div className="col-span-4">
              <AddressInput disabled label="Safe Account" value={account} />
            </div>
          </div>

          <Outlet context={{ formId }} />

          <FormLayout.Actions>
            <InlineForm id={formId}>
              <PrimaryButton
                submit
                intent={Intent.Save}
                busy={useIsPending(Intent.Save)}
              >
                Save
              </PrimaryButton>
            </InlineForm>

            <GhostLinkButton
              to={href('/workspace/:workspaceId/accounts', { workspaceId })}
            >
              Cancel
            </GhostLinkButton>
          </FormLayout.Actions>
        </FormLayout>
      </Page.Main>
    </Page>
  )
}

export default EditAccount

enum Intent {
  Save = 'Save',
}

const getWaypoints = async (
  initiator: HexAddress,
  account: Account,
  selectedRouteId?: string,
): Promise<Waypoints> => {
  if (selectedRouteId == null) {
    return [
      createEoaStartingPoint({ address: initiator }),
      createSafeWaypoint({
        chainId: account.chainId,
        safe: account.address,
        connection: createOwnsConnection(prefixAddress(undefined, initiator)),
      }),
    ]
  }

  const { routes } = await queryRoutes(
    prefixAddress(undefined, initiator),
    prefixAddress(account.chainId, account.address),
  )

  const selectedRoute = routes.find(
    (route) => getRouteId(route.waypoints) === selectedRouteId,
  )

  invariantResponse(selectedRoute != null, 'Could not find selected route')

  return selectedRoute.waypoints
}
