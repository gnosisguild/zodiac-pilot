import { getDefaultConfig } from 'connectkit'
import { anvil, mainnet } from 'viem/chains'
import { createConfig } from 'wagmi'

export const config = (projectId: string) =>
  createConfig(
    getDefaultConfig({
      appName: 'Zodiac Pilot Example App',
      walletConnectProjectId: projectId,
      chains: [mainnet, anvil],
    }),
  )
