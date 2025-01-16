import { invariant } from '@epic-web/invariant'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { type HexAddress, ProviderType } from '@zodiac/schema'
import { type ChainId } from 'ser-kit'
import { useDisconnect } from 'wagmi'
import { Connect } from './Connect'
import { Wallet } from './Wallet'

interface Props {
  pilotAddress: HexAddress | null
  chainId?: ChainId
  providerType?: ProviderType
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: string
  }): void
  onDisconnect(): void
}

export const ConnectWallet = ({
  pilotAddress,
  chainId,
  providerType,
  onConnect,
  onDisconnect,
}: Props) => {
  const { disconnect } = useDisconnect()

  if (pilotAddress == null || pilotAddress === ZERO_ADDRESS) {
    return <Connect onConnect={onConnect} />
  }

  invariant(
    providerType != null,
    'providerType is required when pilotAddress is set',
  )

  return (
    <Wallet
      chainId={chainId}
      providerType={providerType}
      pilotAddress={pilotAddress}
      onDisconnect={() => {
        disconnect()

        onDisconnect()
      }}
    />
  )
}
