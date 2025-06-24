import { authorizedAction, authorizedLoader } from '@/auth-server'
import { getRouteId, RouteSelect } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  findActiveRoute,
  getAccount,
  getRoute,
  getRoutes,
  getWallets,
  updateRouteLabel,
} from '@zodiac/db'
import type { Tenant, User } from '@zodiac/db/schema'
import { getString, getUUID } from '@zodiac/form-data'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import { queryRoutes } from '@zodiac/modules'
import { addressSchema, isUUID, type HexAddress } from '@zodiac/schema'
import {
  AddressSelect,
  Feature,
  Form,
  GhostButton,
  Modal,
  PrimaryButton,
  TextInput,
} from '@zodiac/ui'
import classNames from 'classnames'
import type { UUID } from 'crypto'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { href, NavLink, useOutletContext } from 'react-router'
import { prefixAddress, queryInitiators } from 'ser-kit'
import type { Route } from './+types/routes'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      params: { accountId, routeId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      const url = new URL(request.url)

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')
      invariantResponse(
        routeId == null || isUUID(routeId),
        '"routeId" is not a UUID',
      )

      const account = await getAccount(dbClient(), accountId)
      const wallets = await getWallets(dbClient(), user.id)

      const initiators = await queryInitiators(
        prefixAddress(account.chainId, account.address),
      )

      const initiatorAddress = await findInitiator(tenant, user, {
        accountId: account.id,
        routeId,
        searchParams: url.searchParams,
      })

      const possibleRoutes =
        initiatorAddress == null
          ? { routes: [] }
          : await queryRoutes(
              prefixAddress(undefined, initiatorAddress),
              prefixAddress(account.chainId, account.address),
            )

      const activeRoute = await findActiveRoute(
        dbClient(),
        tenant,
        user,
        account.id,
      )
      const [defaultRoute] = possibleRoutes.routes

      return {
        initiatorWallets: wallets.filter((wallet) =>
          initiators.includes(wallet.address),
        ),
        initiatorAddresses: initiators.filter((address) =>
          wallets.every((wallet) => wallet.address !== address),
        ),
        initiatorAddress,
        possibleRoutes: possibleRoutes.routes,
        routes: await getRoutes(dbClient(), tenant.id, { accountId }),
        comparableId:
          activeRoute == null
            ? defaultRoute == null
              ? undefined
              : getRouteId(defaultRoute.waypoints)
            : getRouteId(activeRoute.route.waypoints),
      }
    },
    { ensureSignedIn: true },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({ request }) => {
      const data = await request.formData()

      switch (getString(data, 'intent')) {
        case Intent.EditLabel: {
          const routeId = getUUID(data, 'routeId')
          const label = getString(data, 'label')

          await updateRouteLabel(dbClient(), routeId, label)

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { routeId } }) {
        if (routeId == null) {
          return false
        }

        invariantResponse(isUUID(routeId), '"routeId" is not a UUID')

        const route = await getRoute(dbClient(), routeId)

        return route.tenantId === tenant.id
      },
    },
  )

const Routes = ({
  loaderData: {
    initiatorAddress,
    initiatorAddresses,
    initiatorWallets,
    possibleRoutes,
    comparableId,
    routes,
  },
  params: { accountId, routeId },
}: Route.ComponentProps) => {
  const { formId } = useOutletContext<{ formId: string }>()

  return (
    <>
      <Feature feature="multiple-routes">
        <div
          role="tablist"
          className="flex items-center gap-2 border-b border-zinc-600"
        >
          {routes.map((route) => (
            <NavLink
              key={route.id}
              aria-labelledby={route.id}
              to={href('/account/:accountId/route/:routeId?', {
                accountId,
                routeId: route.id,
              })}
              role="tab"
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                  isActive
                    ? 'border-indigo-500 text-indigo-600 dark:border-teal-300 dark:text-teal-500'
                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-50',
                )
              }
            >
              <span id={route.id}>{route.label || 'Unnamed route'}</span>

              <EditLabel routeId={route.id} defaultValue={route.label} />
            </NavLink>
          ))}
        </div>
      </Feature>

      <input
        type="hidden"
        form={formId}
        name="initiator"
        value={initiatorAddress ?? ''}
      />

      <Form method="GET">
        {({ submit }) => (
          <AddressSelect
            isClearable
            key={routeId}
            isMulti={false}
            label="Pilot Signer"
            clearLabel="Remove Pilot Signer"
            name="transient-initiator"
            placeholder="Select a wallet form the list"
            defaultValue={initiatorAddress ?? undefined}
            options={[
              ...initiatorWallets.map(({ address, label }) => ({
                address,
                label,
              })),
              ...initiatorAddresses.map((address) => ({
                address,
                label: address,
              })),
            ]}
            onChange={() => submit()}
          />
        )}
      </Form>

      <RouteSelect
        routes={possibleRoutes}
        defaultValue={comparableId}
        form={formId}
        name="routeId"
        initiator={
          initiatorAddress == null
            ? undefined
            : prefixAddress(undefined, initiatorAddress)
        }
      />
    </>
  )
}

export default Routes

const EditLabel = ({
  routeId,
  defaultValue,
}: {
  routeId: UUID
  defaultValue: string | null
}) => {
  const [updating, setUpdating] = useState(false)

  useAfterSubmit(Intent.EditLabel, () => setUpdating(false))

  return (
    <>
      <GhostButton
        iconOnly
        size="tiny"
        icon={Pencil}
        onClick={() => setUpdating(true)}
      >
        Edit route label
      </GhostButton>

      <Modal open={updating} title="Update route label">
        <Form context={{ routeId }}>
          <TextInput
            label="Label"
            name="label"
            placeholder="Route label"
            defaultValue={defaultValue ?? ''}
          />

          <Modal.Actions>
            <PrimaryButton
              submit
              intent={Intent.EditLabel}
              busy={useIsPending(Intent.EditLabel)}
            >
              Update
            </PrimaryButton>
            <Modal.CloseAction>Cancel</Modal.CloseAction>
          </Modal.Actions>
        </Form>
      </Modal>
    </>
  )
}

type FindInitiatorOptions = {
  accountId: UUID
  routeId?: UUID
  searchParams: URLSearchParams
}

const findInitiator = async (
  tenant: Tenant,
  user: User,
  { accountId, routeId, searchParams }: FindInitiatorOptions,
): Promise<HexAddress | null> => {
  if (searchParams.has('transient-initiator')) {
    const initiator = searchParams.get('transient-initiator')

    if (initiator === '') {
      return null
    }

    const address = addressSchema.parse(initiator)

    return address
  }

  if (routeId != null) {
    const route = await getRoute(dbClient(), routeId)

    return route.wallet.address
  }

  const activeRoute = await findActiveRoute(dbClient(), tenant, user, accountId)

  if (activeRoute == null) {
    return null
  }

  return activeRoute.route.wallet.address
}

enum Intent {
  EditLabel = 'EditLabel',
}
