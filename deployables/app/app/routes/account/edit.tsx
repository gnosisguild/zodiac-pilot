import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { ChainSelect, getRouteId } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  createRoute as baseCreateRoute,
  createWallet,
  dbClient,
  findDefaultRoute,
  getAccount,
  getWalletByAddress,
  removeDefaultRoute,
  setDefaultRoute,
  updateAccount,
  type DBClient,
} from '@zodiac/db'
import type { User } from '@zodiac/db/schema'
import {
  getOptionalHexString,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import {
  createEoaStartingPoint,
  createOwnsConnection,
  createSafeWaypoint,
  queryRoutes,
} from '@zodiac/modules'
import { isUUID, type HexAddress } from '@zodiac/schema'
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
        const initiator = getOptionalHexString(data, 'initiator')

        const activeRoute = await findDefaultRoute(tx, tenant, user, accountId)

        if (initiator != null) {
          const selectedRouteId = getOptionalString(data, 'routeId')

          await createWallet(tx, user, {
            address: initiator,
            label: 'Unnamed wallet',
          })

          if (
            activeRoute == null ||
            activeRoute.route.wallet.address !== initiator ||
            getRouteId(activeRoute.route.waypoints) !== selectedRouteId
          ) {
            const route = await createRoute(tx, user, {
              accountId,
              initiator,
              selectedRouteId,
            })

            if (activeRoute != null) {
              await removeDefaultRoute(tx, tenant, user, accountId)
            }

            await setDefaultRoute(tx, tenant, user, route)
          }
        } else {
          await removeDefaultRoute(tx, tenant, user, accountId)
        }

        await updateAccount(tx, accountId, {
          label: getString(data, 'label'),
        })
      })

      return redirect(href('/edit'))
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
  const wallet = await getWalletByAddress(db, user, initiator)
  const account = await getAccount(db, accountId)

  if (selectedRouteId == null) {
    return baseCreateRoute(db, account.tenantId, {
      walletId: wallet.id,
      accountId,
      waypoints: [
        createEoaStartingPoint({ address: wallet.address }),
        createSafeWaypoint({
          chainId: account.chainId,
          safe: account.address,
          connection: createOwnsConnection(
            prefixAddress(undefined, wallet.address),
          ),
        }),
      ],
    })
  }

  const { routes } = await queryRoutes(
    prefixAddress(undefined, wallet.address),
    prefixAddress(account.chainId, account.address),
  )

  const selectedRoute = routes.find(
    (route) => getRouteId(route.waypoints) === selectedRouteId,
  )

  invariantResponse(selectedRoute != null, 'Could not find selected route')

  return baseCreateRoute(db, account.tenantId, {
    walletId: wallet.id,
    accountId,
    waypoints: selectedRoute.waypoints,
  })
}
