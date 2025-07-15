import { ProvideForkContext } from '@/balances-client'
import { Page, WalletProvider } from '@/components'
import { Info, PrimaryButton } from '@zodiac/ui'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { useAccount } from 'wagmi'

const Tokens = () => {
  return (
    <ProvideForkContext>
      <WalletProvider injectedOnly>
        <Connected>
          <Outlet />
        </Connected>
      </WalletProvider>
    </ProvideForkContext>
  )
}

export default Tokens

const Connected = ({ children }: PropsWithChildren) => {
  const { address } = useAccount()
  const [delayed, setDelayed] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDelayed(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  if (address != null) {
    return children
  }

  if (delayed) {
    return null
  }

  return (
    <Page>
      <Page.Header>Connect Wallet</Page.Header>

      <Page.Main>
        <div className="mx-auto my-16 w-1/2">
          <Info title="Connected wallet needed">
            This page requires the Zodiac Pilot extension to be active. Open it
            using the button below.
          </Info>
        </div>

        <div className="mx-auto flex gap-2">
          <PrimaryButton fluid id="ZODIAC-PILOT::open-panel-button">
            Open Pilot
          </PrimaryButton>
        </div>
      </Page.Main>
    </Page>
  )
}
