import { Page, WalletProvider } from '@/components'
import { Info, PrimaryButton } from '@zodiac/ui'
import { type PropsWithChildren } from 'react'
import { Outlet } from 'react-router'
import { useAccount } from 'wagmi'

const Tokens = () => {
  return (
    <WalletProvider injectedOnly>
      <Connected>
        <Outlet />
      </Connected>
    </WalletProvider>
  )
}

export default Tokens

const Connected = ({ children }: PropsWithChildren) => {
  const { address } = useAccount()

  if (address != null) {
    return children
  }

  return (
    <Page>
      <Page.Header>Connect Wallet</Page.Header>

      <Page.Main>
        <div className="mx-auto my-16 w-1/2">
          <Info title="Connected wallet needed">
            The intended use of this page requires a wallet to be connected.
            We've built it to easily test out the functionality offered by
            Zodiac Pilot. When you open the extension it will automatically
            connect to this page.
          </Info>
        </div>

        <div className="mx-auto flex w-1/3">
          <PrimaryButton fluid id="ZODIAC-PILOT::open-panel-button">
            Open Pilot
          </PrimaryButton>
        </div>
      </Page.Main>
    </Page>
  )
}
