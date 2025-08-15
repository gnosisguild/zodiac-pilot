import { HexAddress, verifyHexAddress } from '@zodiac/schema'
import { SecondaryButton } from '@zodiac/ui'
import { PropsWithChildren } from 'react'
import { Address } from './Address'
import { LaunchConnectKit } from './LaunchConnectKit'

type ConnectWalletButtonProps = PropsWithChildren<{
  addressLabels: Record<HexAddress, string>
}>

export const ConnectWalletButton = ({
  children,
  addressLabels,
}: ConnectWalletButtonProps) => (
  <LaunchConnectKit>
    {({ show, address }) => {
      if (address == null) {
        return <SecondaryButton onClick={show}>{children}</SecondaryButton>
      }

      const verifiedAddress = verifyHexAddress(address)

      return (
        <SecondaryButton onClick={show}>
          <Address shorten label={addressLabels[verifiedAddress]}>
            {verifiedAddress}
          </Address>
        </SecondaryButton>
      )
    }}
  </LaunchConnectKit>
)
