import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page, useConnected } from '@/components'
import { ChainSelect } from '@/routes-ui'
import { isSmartContractAddress, jsonRpcProvider, routeTitle } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { Chain, getChainId, verifyChainId } from '@zodiac/chains'
import {
  dbClient,
  getOrCreateAccount,
  getWalletLabels,
  getWorkspace,
} from '@zodiac/db'
import {
  getBoolean,
  getHexString,
  getInt,
  getOptionalString,
} from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createBlankRoute,
  updateAvatar,
  updateChainId,
  updateLabel,
} from '@zodiac/modules'
import { isUUID, verifyPrefixedAddress } from '@zodiac/schema'
import { Error, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { AddressInput, ConnectWalletButton } from '@zodiac/web3'
import { href, redirect } from 'react-router'
import { unprefixAddress } from 'ser-kit'
import type { Route } from './+types/create'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'New Safe Account') },
]

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { prefixedAddress },
      context: {
        auth: { user },
      },
    }) => {
      return {
        defaultChainId:
          prefixedAddress != null
            ? getChainId(verifyPrefixedAddress(prefixedAddress))
            : Chain.ETH,
        defaultAddress:
          prefixedAddress != null
            ? unprefixAddress(verifyPrefixedAddress(prefixedAddress))
            : undefined,
        addressLabels: await getWalletLabels(dbClient(), user.id),
      }
    },
    { ensureSignedIn: true },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      context: {
        auth: { user, tenant },
      },
      params: { workspaceId },
    }) => {
      const data = await request.formData()

      const label = getOptionalString(data, 'label')
      const avatar = getHexString(data, 'avatar')
      const chainId = verifyChainId(getInt(data, 'chainId'))

      if (!(await isSmartContractAddress(jsonRpcProvider(chainId), avatar))) {
        return { error: 'Account is not a smart contract' }
      }

      invariantResponse(isUUID(workspaceId), '"workspaceId" is not a UUID')

      const account = await getOrCreateAccount(dbClient(), tenant, {
        label,
        chainId,
        address: avatar,
        workspaceId,
        ownerId: user.id,
      })

      let route = updateChainId(
        updateAvatar(createBlankRoute(), { safe: account.address }),
        account.chainId,
      )

      if (account.label != null) {
        route = updateLabel(route, account.label)
      }

      return { route, account }
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

export const clientAction = async ({
  request,
  serverAction,
  params: { workspaceId },
}: Route.ClientActionArgs) => {
  const data = await request.clone().formData()

  const { error, route, account } = await serverAction()

  if (error != null) {
    return { error }
  }

  if (getBoolean(data, 'connected')) {
    const { promise, resolve } = Promise.withResolvers<void>()

    companionRequest(
      {
        type: CompanionAppMessageType.SAVE_AND_LAUNCH,
        data: route,
        account,
      },
      () => {
        resolve()
      },
    )

    await promise
  }

  return redirect(href(`/workspace/:workspaceId/accounts`, { workspaceId }))
}

const CreateAccount = ({
  loaderData: { defaultChainId, defaultAddress, addressLabels },
  actionData,
}: Route.ComponentProps) => {
  const connected = useConnected()

  return (
    <Page>
      <Page.Header
        action={
          <ConnectWalletButton addressLabels={addressLabels}>
            Connect Pilot Signer
          </ConnectWalletButton>
        }
      >
        New Safe Account
      </Page.Header>

      <Page.Main>
        <Form context={{ connected }}>
          {actionData && 'error' in actionData && (
            <Error title="Could not create account">{actionData.error}</Error>
          )}

          <TextInput
            label="Label"
            name="label"
            placeholder="Give this account a descriptive name"
          />

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
              <ChainSelect name="chainId" defaultValue={defaultChainId} />
            </div>

            <div className="col-span-4">
              <AddressInput
                required
                label="Address"
                name="avatar"
                defaultValue={defaultAddress}
              />
            </div>
          </div>

          <Form.Actions>
            <PrimaryButton submit busy={useIsPending()}>
              Create
            </PrimaryButton>
          </Form.Actions>
        </Form>
      </Page.Main>
    </Page>
  )
}

export default CreateAccount
