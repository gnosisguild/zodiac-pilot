import { getAvailableChains } from '@/balances-server'
import {
  AvatarInput,
  ConnectWalletButton,
  OnlyConnected,
  Page,
} from '@/components'
import { useIsPending } from '@/hooks'
import { ChainSelect, ProvideChains } from '@/routes-ui'
import { isSmartContractAddress, jsonRpcProvider } from '@/utils'
import { Chain as ChainEnum, verifyChainId } from '@zodiac/chains'
import {
  getHexString,
  getInt,
  getOptionalHexString,
  getOptionalString,
} from '@zodiac/form-data'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createBlankRoute,
  createEoaAccount,
  updateAvatar,
  updateChainId,
  updateLabel,
  updateStartingPoint,
} from '@zodiac/modules'
import { isHexAddress, type ExecutionRoute } from '@zodiac/schema'
import { Error, Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { href, redirect } from 'react-router'
import { prefixAddress, type ChainId } from 'ser-kit'
import { useAccount } from 'wagmi'
import type { Route } from './+types/start'

export const loader = async () => ({ chains: await getAvailableChains() })

export const clientLoader = async ({
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const { promise, resolve } = Promise.withResolvers<ExecutionRoute[]>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTES,
    },
    (response) => resolve(response.routes),
  )

  const [serverData, routes] = await Promise.all([serverLoader(), promise])

  return { ...serverData, routes }
}

clientLoader.hydrate = true as const

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const data = await request.formData()

  let route = createBlankRoute()

  const initiator = getOptionalHexString(data, 'initiator')

  if (initiator != null) {
    route = updateStartingPoint(route, createEoaAccount({ address: initiator }))
  }

  const label = getOptionalString(data, 'label')

  if (label != null) {
    route = updateLabel(route, label)
  }

  const avatar = getHexString(data, 'avatar')
  const chainId = verifyChainId(getInt(data, 'chainId'))

  if (!(await isSmartContractAddress(jsonRpcProvider(chainId), avatar))) {
    return { error: 'Account is not a smart contract' }
  }

  route = updateChainId(updateAvatar(route, { safe: avatar }), chainId)

  window.postMessage(
    { type: CompanionAppMessageType.SAVE_AND_LAUNCH, data: route },
    '*',
  )

  return redirect(href(`/tokens/balances`))
}

const Start = ({ loaderData, actionData }: Route.ComponentProps) => {
  const { chains } = loaderData
  const { address, chainId } = useAccount()
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    verifyChainId(chainId || ChainEnum.ETH),
  )

  useEffect(() => {
    if (chainId == null) {
      return
    }

    setSelectedChainId(verifyChainId(chainId))
  }, [chainId])

  return (
    <ProvideChains chains={chains}>
      <Page>
        <Page.Header
          action={
            <ConnectWalletButton
              connectLabel="Connect signer wallet"
              connectedLabel="Signer wallet"
            />
          }
        >
          New account
        </Page.Header>

        <Page.Main>
          <OnlyConnected>
            <Form context={{ initiator: address }}>
              {actionData && (
                <Error title="Could not create account">
                  {actionData.error}
                </Error>
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
                initiator={
                  address == null
                    ? undefined
                    : isHexAddress(address)
                      ? prefixAddress(undefined, address)
                      : undefined
                }
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
    </ProvideChains>
  )
}

export default Start
