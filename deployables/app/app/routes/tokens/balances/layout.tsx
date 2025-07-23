import { Page } from '@/components'
import { ConnectWalletButton } from '@zodiac/web3'
import { Outlet } from 'react-router'

const BalancesLayout = () => (
  <Page fullWidth>
    <Page.Header
      action={
        <ConnectWalletButton
          connectedLabel="Account"
          connectLabel="Connect account"
        />
      }
    >
      Balances
    </Page.Header>

    <Page.Main>
      <Outlet />
    </Page.Main>
  </Page>
)

export default BalancesLayout
