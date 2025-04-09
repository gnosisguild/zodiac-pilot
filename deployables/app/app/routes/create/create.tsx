import {
  AvatarInput,
  ConnectWalletButton,
  fromVersion,
  OnlyConnectedWhenLoggedOut,
  Page,
} from '@/components'
import { createAccount, dbClient } from '@/db'
import { useIsPending } from '@/hooks'
import { ChainSelect } from '@/routes-ui'
import { isSmartContractAddress, jsonRpcProvider, routeTitle } from '@/utils'
import { authKitAction } from '@/workOS/server'
import { authkitLoader } from '@workos-inc/authkit-react-router'
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
  { title: routeTitle(matches, 'New SafeAccount') },
]

export const loader = (args: Route.LoaderArgs) => authkitLoader(args)

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const { promise, resolve } = Promise.withResolvers<ExecutionRoute[]>()

  const { user } = await serverLoader()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTES,
    },
    (response) => resolve(response.routes),
  )

  return { routes: await promise, user }
}

clientLoader.hydrate = true as const

export const action = (args: Route.ActionArgs) =>
  authKitAction(
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
          await createAccount(dbClient(), tenant, user, {
            label,
            chainId,
            address: avatar,
          })
        } catch {
          return { error: 'An account with this address already exists.' }
        }
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
            connectLabel="Connect Pilot Signer"
            connectedLabel="Pilot Signer"
          />
        }
      >
        New Safe Account
      </Page.Header>

      <Page.Main>
        <OnlyConnectedWhenLoggedOut user={loaderData.user}>
          <Form>
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
                  chainId={selectedChainId}
                  name="avatar"
                  knownRoutes={'routes' in loaderData ? loaderData.routes : []}
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
