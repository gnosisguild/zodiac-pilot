import {
  AvatarInput,
  ConnectWalletButton,
  fromVersion,
  OnlyConnected,
  Page,
} from '@/components'
import { createAccount, dbClient } from '@/db'
import { useIsPending } from '@/hooks'
import { ChainSelect } from '@/routes-ui'
import { isSmartContractAddress, jsonRpcProvider, routeTitle } from '@/utils'
import { authKitAction } from '@/workOS/server'
import { Chain as ChainEnum, verifyChainId } from '@zodiac/chains'
import { getHexString, getInt, getOptionalString } from '@zodiac/form-data'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createBlankRoute,
  updateAvatar,
  updateChainId,
  updateLabel,
} from '@zodiac/modules'
import { type ExecutionRoute } from '@zodiac/schema'
import { Error, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { useState } from 'react'
import { href, redirectDocument } from 'react-router'
import { type ChainId } from 'ser-kit'
import type { Route } from './+types/create'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'New Account') },
]

export const clientLoader = async () => {
  const { promise, resolve } = Promise.withResolvers<ExecutionRoute[]>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTES,
    },
    (response) => resolve(response.routes),
  )

  return { routes: await promise }
}

clientLoader.hydrate = true as const

export const action = (args: Route.ActionArgs) =>
  authKitAction(
    args,
    async ({
      request,
      context: {
        auth: { user },
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
        await createAccount(dbClient(), user, {
          label,
          chainId,
          address: avatar,
        })
      }

      return { route }
    },
  )

export const clientAction = async ({
  serverAction,
}: Route.ClientActionArgs) => {
  const { route, error } = await serverAction()

  if (error != null) {
    return { error }
  }

  const { promise, resolve } = Promise.withResolvers<void>()

  fromVersion(
    '3.8.2',
    () =>
      companionRequest(
        { type: CompanionAppMessageType.SAVE_AND_LAUNCH, data: route },
        () => resolve(),
      ),
    () => {
      window.postMessage(
        { type: CompanionAppMessageType.SAVE_AND_LAUNCH, data: route },
        '*',
      )

      resolve()
    },
  )

  await promise

  return redirectDocument(href(`/tokens/balances`))
}

const Start = ({ loaderData, actionData }: Route.ComponentProps) => {
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    verifyChainId(ChainEnum.ETH),
  )

  return (
    <Page>
      <Page.Header
        action={
          <ConnectWalletButton
            connectLabel="Connect signer wallet"
            connectedLabel="Signer wallet"
          />
        }
      >
        New Account
      </Page.Header>

      <Page.Main>
        <OnlyConnected>
          <Form>
            {actionData && (
              <Error title="Could not create account">{actionData.error}</Error>
            )}

            <ChainSelect
              name="chainId"
              value={selectedChainId}
              onChange={setSelectedChainId}
            />

            <AvatarInput
              required
              isClearable
              label="Account"
              chainId={selectedChainId}
              name="avatar"
              knownRoutes={'routes' in loaderData ? loaderData.routes : []}
            />

            <TextInput
              label="Label"
              name="label"
              placeholder="Give this account a descriptive name"
            />

            <Form.Actions>
              <PrimaryButton submit busy={useIsPending()}>
                Create
              </PrimaryButton>
            </Form.Actions>
          </Form>
        </OnlyConnected>
      </Page.Main>
    </Page>
  )
}

export default Start
