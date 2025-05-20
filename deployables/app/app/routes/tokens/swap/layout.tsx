import { ConnectWalletButton, Page } from '@/components'
import { Outlet } from 'react-router'

const SwapLayout = () => (
  <Page>
    <Page.Header
      action={
        <ConnectWalletButton
          connectedLabel="Account"
          connectLabel="Connect account"
        />
      }
    >
      Swap tokens
    </Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default SwapLayout
