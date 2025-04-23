import { authorizedAction } from '@/auth'
import {
  AvatarInput,
  ConnectWalletButton,
  OnlyConnectedWhenLoggedOut,
  Page,
  useConnected,
} from '@/components'
import { useIsPending } from '@/hooks'
import { ChainSelect } from '@/routes-ui'
import { isSmartContractAddress, jsonRpcProvider, routeTitle } from '@/utils'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import { Chain as ChainEnum, verifyChainId } from '@zodiac/chains'
import { createAccount, dbClient } from '@zodiac/db'
import {
  getBoolean,
  getHexString,
  getInt,
  getOptionalString,
} from '@zodiac/form-data'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createBlankRoute,
  updateAvatar,
  updateChainId,
  updateLabel,
} from '@zodiac/modules'
import { isHexAddress } from '@zodiac/schema'
import { Error, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { useState } from 'react'
import { href, redirectDocument } from 'react-router'
import { prefixAddress, type ChainId } from 'ser-kit'
import { useAccount } from 'wagmi'
import type { Route } from './+types/create'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'New SafeAccount') },
]

export const loader = (args: Route.LoaderArgs) => authkitLoader(args)

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

const Start = ({ loaderData, actionData }: Route.ComponentProps) => {
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    verifyChainId(ChainEnum.ETH),
  )
  const { address } = useAccount()
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
        <OnlyConnectedWhenLoggedOut user={loaderData.user}>
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
                <ChainSelect
                  name="chainId"
                  value={selectedChainId}
                  onChange={setSelectedChainId}
                />
              </div>

              <div className="col-span-4">
                <AvatarInput
                  required
                  isClearable
                  label="Address"
                  initiator={
                    isHexAddress(address)
                      ? prefixAddress(undefined, address)
                      : undefined
                  }
                  chainId={selectedChainId}
                  name="avatar"
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
