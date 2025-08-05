import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  createRoute,
  dbClient,
  findDefaultRoute,
  getAccount,
  getOrCreateWallet,
  getWallets,
  setDefaultRoute,
} from '@zodiac/db'
import { getHexString, getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { queryInitiators, queryRoutes } from '@zodiac/modules'
import { isUUID } from '@zodiac/schema'
import { Form, Modal, PrimaryButton, TextInput, Warning } from '@zodiac/ui'
import { AddressSelect } from '@zodiac/web3'
import { href, redirect, useNavigate } from 'react-router'
import { prefixAddress } from 'ser-kit'
import type { Route } from './+types/add-route'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { user },
      },
      params: { accountId },
    }) => {
      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const [wallets, account] = await Promise.all([
        getWallets(dbClient(), user.id),
        getAccount(dbClient(), accountId),
      ])

      const { error, initiators } = await queryInitiators(
        prefixAddress(account.chainId, account.address),
      )

      return {
        couldQueryInitiators: error == null,
        possibleInitiators:
          error == null
            ? [
                ...wallets
                  .filter((wallet) => initiators.includes(wallet.address))
                  .map(({ address, label }) => ({ address, label })),
                ...initiators
                  .filter((address) =>
                    wallets.every((wallet) => wallet.address !== address),
                  )
                  .map((address) => ({ address, label: address })),
              ]
            : wallets.map(({ address, label }) => ({ address, label })),
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
        auth: { tenant, user },
      },
    }) => {
      const data = await request.formData()

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const initiator = getHexString(data, 'initiator')
      const label = getString(data, 'label')

      const route = await dbClient().transaction(async (tx) => {
        const wallet = await getOrCreateWallet(tx, user, {
          label: 'Unnamed wallet',
          address: initiator,
        })
        const account = await getAccount(tx, accountId)

        const queryRoutesResult = await queryRoutes(
          prefixAddress(undefined, initiator),
          prefixAddress(account.chainId, account.address),
        )

        const [defaultSerRoute] = queryRoutesResult.routes

        const route = await createRoute(tx, tenant.id, {
          walletId: wallet.id,
          accountId: account.id,
          waypoints: defaultSerRoute.waypoints,
          label,
        })

        const defaultRoute = await findDefaultRoute(tx, tenant, user, accountId)

        if (defaultRoute == null) {
          await setDefaultRoute(tx, tenant, user, route)
        }

        return route
      })

      return redirect(
        href('/workspace/:workspaceId/accounts/:accountId/route/:routeId', {
          accountId,
          workspaceId,
          routeId: route.id,
        }),
      )
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

const AddRoute = ({
  loaderData: { possibleInitiators, couldQueryInitiators },
  params: { workspaceId, accountId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      title="Add route"
      open
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/accounts/:accountId', {
            workspaceId,
            accountId,
          }),
          { replace: true },
        )
      }
    >
      <Form replace>
        {!couldQueryInitiators && (
          <Warning title="Could not retrieve signers">
            We could not query possible pilot signers for this account.
          </Warning>
        )}

        <TextInput
          required
          label="Label"
          name="label"
          placeholder="New route"
        />

        <AddressSelect
          required
          isMulti={false}
          label="Pilot Signer"
          name="initiator"
          placeholder="Select a wallet form the list"
          options={possibleInitiators}
        />

        <Modal.Actions>
          <PrimaryButton
            submit
            intent={Intent.AddRoute}
            busy={useIsPending(Intent.AddRoute)}
          >
            Add
          </PrimaryButton>
          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default AddRoute
