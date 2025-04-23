import { authorizedAction, authorizedLoader } from '@/auth'
import { Page } from '@/components'
import { ChainSelect, routeId, RouteSelect } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  activateRoute,
  createRoute as baseCreateRoute,
  dbClient,
  findActiveRoute,
  getAccount,
  getWalletByAddress,
  getWallets,
  removeActiveRoute,
  updateAccount,
  type DBClient,
} from '@zodiac/db'
import type { Tenant, User } from '@zodiac/db/schema'
import {
  getOptionalHexString,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { queryRoutes } from '@zodiac/modules'
import { addressSchema, isUUID, type HexAddress } from '@zodiac/schema'
import {
  AddressInput,
  AddressSelect,
  Form,
  FormLayout,
  GhostLinkButton,
  InlineForm,
  PrimaryButton,
  TextInput,
} from '@zodiac/ui'
import type { UUID } from 'crypto'
import { useId } from 'react'
import { href, redirect } from 'react-router'
import { prefixAddress, queryInitiators } from 'ser-kit'
import type { Route } from './+types/edit'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      params: { accountId },
      context: {
        auth: { user, tenant },
      },
    }) => {
      const url = new URL(request.url)

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const account = await getAccount(dbClient(), accountId)
      const wallets = await getWallets(dbClient(), user.id)
      const initiators = await queryInitiators(
        prefixAddress(account.chainId, account.address),
      )
      const initiator = await getInitiator(
        tenant,
        user,
        account.id,
        url.searchParams,
      )

      const routesResult =
        initiator == null
          ? { routes: [] }
          : await queryRoutes(
              prefixAddress(undefined, initiator.address),
              prefixAddress(account.chainId, account.address),
            )

      const activeRoute = await findActiveRoute(
        dbClient(),
        tenant,
        user,
        account.id,
      )
      const [defaultRoute] = routesResult.routes

      return {
        label: account.label || '',
        comparableId:
          activeRoute == null
            ? defaultRoute == null
              ? undefined
              : routeId(defaultRoute.waypoints)
            : routeId(activeRoute.route.waypoints),
        initiatorWallet: initiator == null ? undefined : initiator,
        initiators: wallets.filter((wallet) =>
          initiators.includes(wallet.address),
        ),
        account: account.address,
        chainId: account.chainId,
        routes: routesResult.routes,
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

        const activeRoute = await findActiveRoute(tx, tenant, user, accountId)

        if (initiator != null) {
          const selectedRouteId = getOptionalString(data, 'routeId')

          if (
            activeRoute == null ||
            activeRoute.route.wallet.address !== initiator ||
            routeId(activeRoute.route.waypoints) !== selectedRouteId
          ) {
            const route = await createRoute(tx, user, {
              accountId,
              initiator,
              selectedRouteId,
            })

            if (activeRoute != null) {
              await removeActiveRoute(tx, tenant, user, accountId)
            }

            await activateRoute(tx, tenant, user, route)
          }
        } else {
          await removeActiveRoute(tx, tenant, user, accountId)
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
  loaderData: {
    label,
    initiators,
    initiatorWallet,
    account,
    chainId,
    routes,
    comparableId,
  },
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

          <Form method="GET">
            {({ submit }) => (
              <AddressSelect
                isClearable
                isMulti={false}
                label="Pilot Signer"
                clearLabel="Remove Pilot Signer"
                name="initiator"
                placeholder="Select a wallet form the list"
                defaultValue={initiatorWallet?.address}
                options={initiators.map(({ address, label }) => ({
                  address,
                  label,
                }))}
                onChange={() => submit()}
              />
            )}
          </Form>

          <RouteSelect
            routes={routes}
            defaultValue={comparableId}
            form={formId}
            name="routeId"
            initiator={
              initiatorWallet == null
                ? undefined
                : prefixAddress(undefined, initiatorWallet.address)
            }
          />

          <FormLayout.Actions>
            <InlineForm
              id={formId}
              context={{ initiator: initiatorWallet?.address }}
            >
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

const getInitiator = async (
  tenant: Tenant,
  user: User,
  accountId: UUID,
  searchParams: URLSearchParams,
) => {
  if (searchParams.has('initiator')) {
    const initiator = searchParams.get('initiator')

    if (initiator === '') {
      return null
    }

    const address = addressSchema.parse(initiator)

    return getWalletByAddress(dbClient(), user, address)
  }

  const activeRoute = await findActiveRoute(dbClient(), tenant, user, accountId)

  if (activeRoute == null) {
    return null
  }

  return activeRoute.route.wallet
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
    return baseCreateRoute(db, wallet, account)
  }

  const { routes } = await queryRoutes(
    prefixAddress(undefined, wallet.address),
    prefixAddress(account.chainId, account.address),
  )

  const selectedRoute = routes.find(
    (route) => routeId(route.waypoints) === selectedRouteId,
  )

  invariantResponse(selectedRoute != null, 'Could not find selected route')

  return baseCreateRoute(db, wallet, account, {
    waypoints: selectedRoute.waypoints,
  })
}
