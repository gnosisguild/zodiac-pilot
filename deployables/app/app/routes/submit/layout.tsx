import { ProvideForkContext } from '@/balances-client'
import { ConnectWalletButton, Page, WalletProvider } from '@/components'
import { Outlet } from 'react-router'

const SubmitLayout = () => (
  <ProvideForkContext>
    <WalletProvider>
      <Page fullWidth>
        <Page.Header
          action={
            <ConnectWalletButton
              connectLabel="Connect signer wallet"
              connectedLabel="Signer wallet"
            />
          }
        >
          Sign Transaction Bundle
        </Page.Header>

        <Page.Main>
          <Outlet />
        </Page.Main>
      </Page>
    </WalletProvider>
  </ProvideForkContext>
)

export default SubmitLayout
