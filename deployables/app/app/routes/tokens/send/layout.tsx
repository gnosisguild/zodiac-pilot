import { ConnectWalletButton, Page } from '@/components'
import { Outlet } from 'react-router'

const SendLayout = () => (
  <Page>
    <Page.Header
      action={
        <ConnectWalletButton
          connectedLabel="Account"
          connectLabel="Connect account"
        />
      }
    >
      Send tokens
    </Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default SendLayout
