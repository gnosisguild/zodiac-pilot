import {
  AvatarInput,
  ChainSelect,
  ConnectWallet,
  ConnectWalletButton,
  Page,
  WalletProvider,
} from '@/components'
import { Chain, verifyChainId } from '@zodiac/chains'
import { getHexString, getInt } from '@zodiac/form-data'
import type { HexAddress } from '@zodiac/schema'
import { Form, PrimaryButton } from '@zodiac/ui'
import { useState } from 'react'
import { redirect } from 'react-router'
import { prefixAddress, type ChainId } from 'ser-kit'
import type { Route } from './+types/start'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData()

  const pilotAddress = getHexString(data, 'pilotAddress')
  const avatar = getHexString(data, 'avatar')
  const chainId = verifyChainId(getInt(data, 'chainId'))

  return redirect(`/create/${pilotAddress}/${prefixAddress(chainId, avatar)}`)
}

const Start = () => {
  const [pilotAddress, setPilotAddress] = useState<HexAddress | null>(null)
  const [chainId, setChainId] = useState<ChainId>(Chain.ETH)

  return (
    <WalletProvider>
      <Page>
        <Page.Header
          action={
            <ConnectWalletButton
              connectLabel="Connect signer wallet"
              connectedLabel="Signer wallet"
            />
          }
        >
          Create new route
        </Page.Header>

        <Page.Main>
          <Form context={{ pilotAddress }}>
            <ConnectWallet
              chainId={chainId}
              pilotAddress={pilotAddress}
              onConnect={({ address }) => setPilotAddress(address)}
              onDisconnect={() => setPilotAddress(null)}
            />

            <ChainSelect name="chainId" value={chainId} onChange={setChainId} />

            <AvatarInput
              chainId={chainId}
              pilotAddress={pilotAddress}
              name="avatar"
            />

            <Form.Actions>
              <PrimaryButton submit>Next: Choose route</PrimaryButton>
            </Form.Actions>
          </Form>
        </Page.Main>
      </Page>
    </WalletProvider>
  )
}

export default Start
