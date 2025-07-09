import { authorizedAction, authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  createRoute,
  dbClient,
  getAccount,
  getOrCreateWallet,
  getWallets,
} from '@zodiac/db'
import { getHexString, getString } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { queryRoutes } from '@zodiac/modules'
import { isUUID } from '@zodiac/schema'
import {
  AddressSelect,
  Form,
  Modal,
  PrimaryButton,
  TextInput,
} from '@zodiac/ui'
import { href, redirect, useNavigate } from 'react-router'
import { prefixAddress, queryInitiators } from 'ser-kit'
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

      const initiators = await queryInitiators(
        prefixAddress(account.chainId, account.address),
      )

      return {
        possibleInitiators: [
          ...wallets
            .filter((wallet) => initiators.includes(wallet.address))
            .map(({ address, label }) => ({ address, label })),
          ...initiators
            .filter((address) =>
              wallets.every((wallet) => wallet.address !== address),
            )
            .map((address) => ({ address, label: address })),
        ],
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

      const wallet = await getOrCreateWallet(dbClient(), user, {
        label: 'Unnamed wallet',
        address: initiator,
      })
      const account = await getAccount(dbClient(), accountId)

      const queryRoutesResult = await queryRoutes(
        prefixAddress(undefined, initiator),
        prefixAddress(account.chainId, account.address),
      )

      const [defaultRoute] = queryRoutesResult.routes

      const route = await createRoute(dbClient(), tenant.id, {
        walletId: wallet.id,
        accountId: account.id,
        waypoints: defaultRoute.waypoints,
        label,
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
  loaderData: { possibleInitiators },
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
        )
      }
    >
      <Form>
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
