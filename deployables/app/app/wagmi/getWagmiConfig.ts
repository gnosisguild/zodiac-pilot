import { getDefaultConfig } from 'connectkit'
import type { Ref } from 'react'
import type { ChainId } from 'ser-kit'
import { createConfig } from 'wagmi'
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  bob,
  celo,
  gnosis,
  mainnet,
  mantle,
  optimism,
  polygon,
  sepolia,
  sonic,
  unichain,
  worldchain,
  type Chain,
} from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

const WALLETCONNECT_PROJECT_ID = '0f8a5e2cf60430a26274b421418e8a27'

const chains: Record<ChainId, Chain> = {
  [mainnet.id]: mainnet,
  [optimism.id]: optimism,
  [gnosis.id]: gnosis,
  [polygon.id]: polygon,
  [sepolia.id]: sepolia,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
  [avalanche.id]: avalanche,
  [celo.id]: celo,
  [sonic.id]: sonic,
  [berachain.id]: berachain,
  [unichain.id]: unichain,
  [worldchain.id]: worldchain,
  [bob.id]: bob,
  [mantle.id]: mantle,
}

export const getWagmiConfig = (injectedOnly: boolean) =>
  createConfig(
    getDefaultConfig({
      appName: 'Zodiac Pilot',
      ssr: true,
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
      chains: Object.values(chains) as any,
      connectors: getConnectors(injectedOnly),
    }),
  )

const getConnectors = (injectedOnly: boolean) => {
  if (injectedOnly) {
    return [injected()]
  }

  return [injected(), metaMask(), getWalletConnectConnector()]
}

const walletConnectConnectorRef: Ref<ReturnType<typeof walletConnect>> = {
  current: null,
}

const getWalletConnectConnector = () => {
  if (walletConnectConnectorRef.current) {
    return walletConnectConnectorRef.current
  }

  walletConnectConnectorRef.current = walletConnect({
    projectId: WALLETCONNECT_PROJECT_ID,
    showQrModal: false,
  })

  return walletConnectConnectorRef.current
}
