import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { ChainSelect, getRouteId } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  createRoute as baseCreateRoute,
  createWallet,
  dbClient,
  getAccount,
  getRoute,
  removeRoute,
  setDefaultRoute,
  updateAccount,
  updateRoutePath,
  type DBClient,
} from '@zodiac/db'
import type { Account, User } from '@zodiac/db/schema'
import {
  getOptionalHexString,
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
import type { UUID } from 'crypto'
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
      async hasAccess({ user, params: { accountId } }) {
        invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

        const account = await getAccount(dbClient(), accountId)

        return account.createdById === user.id
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { accountId },
      context: {
        auth: { user, tenant },
      },
    }) => {
      const data = await request.formData()

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      await dbClient().transaction(async (tx) => {
        await updateAccount(tx, accountId, {
          label: getString(data, 'label'),
        })

        const initiator = getOptionalHexString(data, 'initiator')
        const selectedRouteId = getOptionalString(data, 'serRouteId')
        const routeId = getOptionalUUID(data, 'routeId')

        if (routeId == null) {
          if (initiator == null) {
            return
          }

          const route = await createRoute(tx, user, {
            accountId,
            initiator,
            selectedRouteId,
          })

          await setDefaultRoute(tx, tenant, user, route)

          return
        }

        if (initiator == null) {
          await removeRoute(tx, routeId)

          return
        }

        const account = await getAccount(tx, accountId)
        const waypoints = await getWaypoints(
          initiator,
          account,
          selectedRouteId,
        )

        const route = await getRoute(tx, routeId)

        const wallet = await createWallet(tx, user, {
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

      return redirect(href('/edit'))
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

            <GhostLinkButton to={href('/edit')}>Cancel</GhostLinkButton>
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

type CreateRouteOptions = {
  initiator: HexAddress
  accountId: UUID
  selectedRouteId: string | undefined
}

const createRoute = async (
  db: DBClient,
  user: User,
  { accountId, initiator, selectedRouteId }: CreateRouteOptions,
) => {
  const wallet = await createWallet(db, user, {
    address: initiator,
    label: 'Unnamed wallet',
  })
  const account = await getAccount(db, accountId)

  return baseCreateRoute(db, account.tenantId, {
    walletId: wallet.id,
    accountId,
    waypoints: await getWaypoints(wallet.address, account, selectedRouteId),
  })
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
