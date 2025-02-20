import { getAvailableChains } from '@/balances-server'
import {
  AvatarInput,
  ConnectWalletButton,
  OnlyConnected,
  Page,
} from '@/components'
import { ChainSelect, ProvideChains } from '@/routes-ui'
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
import type { ExecutionRoute } from '@zodiac/schema'
import { Form, PrimaryButton, TextInput } from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { redirect } from 'react-router'
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

  route = updateChainId(updateAvatar(route, { safe: avatar }), chainId)

  window.postMessage(
    { type: CompanionAppMessageType.SAVE_AND_LAUNCH, data: route },
    '*',
  )

  return redirect(`/tokens/balances`)
}

const Start = ({ loaderData }: Route.ComponentProps) => {
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
          New Account
        </Page.Header>

        <Page.Main>
          <OnlyConnected>
            <Form context={{ initiator: address }}>
              <ChainSelect
                name="chainId"
                value={selectedChainId}
                onChange={setSelectedChainId}
              />

              <AvatarInput
                required
                label="Avatar"
                chainId={selectedChainId}
                initiator={
                  address == null
                    ? undefined
                    : prefixAddress(undefined, address)
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
                <PrimaryButton submit>Create</PrimaryButton>
              </Form.Actions>
            </Form>
          </OnlyConnected>
        </Page.Main>
      </Page>
    </ProvideChains>
  )
}

export default Start
