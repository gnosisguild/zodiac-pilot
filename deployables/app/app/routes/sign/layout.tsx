import { Page } from '@/components'
import { ConnectWalletButton } from '@zodiac/web3'
import { Outlet } from 'react-router'

const SubmitLayout = () => (
  <Page fullWidth>
    <Page.Header
      action={
        <ConnectWalletButton
          connectLabel="Connect Pilot Signer"
          connectedLabel="Pilot Signer"
        />
      }
    >
      Sign Transaction Bundle
    </Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default SubmitLayout
