import { authorizedAction, authorizedLoader } from '@/auth-server'
import {
  ConnectWalletButton,
  OnlyConnectedWhenLoggedOut,
  Page,
  useConnected,
} from '@/components'
import { ChainSelect } from '@/routes-ui'
import { isSmartContractAddress, jsonRpcProvider, routeTitle } from '@/utils'
import { Chain, getChainId, verifyChainId } from '@zodiac/chains'
import { createAccount, dbClient } from '@zodiac/db'
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
import { verifyPrefixedAddress } from '@zodiac/schema'
import { AddressInput, Error, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, redirectDocument } from 'react-router'
import { unprefixAddress } from 'ser-kit'
import type { Route } from './+types/create'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'New SafeAccount') },
]

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { prefixedAddress },
      context: {
        auth: { workOsUser, user },
      },
    }) => {
      if (user == null) {
        return { user: workOsUser, defaultChainId: Chain.ETH }
      }

      return {
        user: workOsUser,
        defaultChainId:
          prefixedAddress != null
            ? getChainId(verifyPrefixedAddress(prefixedAddress))
            : Chain.ETH,
        defaultAddress:
          prefixedAddress != null
            ? unprefixAddress(verifyPrefixedAddress(prefixedAddress))
            : undefined,
      }
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      context: {
        auth: { user, tenant },
      },
    }) => {
      const data = await request.formData()

      const label = getOptionalString(data, 'label')
      const avatar = getHexString(data, 'avatar')
      const chainId = verifyChainId(getInt(data, 'chainId'))

      if (!(await isSmartContractAddress(jsonRpcProvider(chainId), avatar))) {
        return { error: 'Account is not a smart contract' }
      }

      let route = createBlankRoute()

      if (label != null) {
        route = updateLabel(route, label)
      }

      route = updateChainId(updateAvatar(route, { safe: avatar }), chainId)

      if (user != null) {
        try {
          const account = await createAccount(dbClient(), tenant, user, {
            label,
            chainId,
            address: avatar,
          })

          return { account, route }
        } catch {
          return { error: 'An account with this address already exists.' }
        }
      }

      return { route }
    },
  )

export const clientAction = async ({
  request,
  serverAction,
}: Route.ClientActionArgs) => {
  const data = await request.clone().formData()

  const { route, error, account } = await serverAction()

  if (error != null) {
    return { error }
  }

  if (getBoolean(data, 'connected')) {
    const { promise, resolve } = Promise.withResolvers<void>()

    companionRequest(
      { type: CompanionAppMessageType.SAVE_AND_LAUNCH, data: route, account },
      () => resolve(),
    )

    await promise
  }

  return redirectDocument(href(`/tokens/balances`))
}

const Start = ({
  loaderData: { user, defaultChainId, defaultAddress },
  actionData,
}: Route.ComponentProps) => {
  const connected = useConnected()

  return (
    <Page>
      <Page.Header
        action={
          <ConnectWalletButton
            connectLabel="Connect Pilot Signer"
            connectedLabel="Pilot Signer"
          />
        }
      >
        New Safe Account
      </Page.Header>

      <Page.Main>
        <OnlyConnectedWhenLoggedOut user={user}>
          <Form context={{ connected }}>
            {actionData && (
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
        </OnlyConnectedWhenLoggedOut>
      </Page.Main>
    </Page>
  )
}

export default Start
