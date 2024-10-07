import { getDefaultConfig } from 'connectkit'
import { createConfig, http } from 'wagmi'
import { anvil, mainnet } from 'wagmi/chains'

export const config = (projectId: string) =>
  createConfig(
    getDefaultConfig({
      appName: 'Zodiac Pilot Example App',
      walletConnectProjectId: projectId,
      chains: [mainnet, anvil],
      transports: {
        [mainnet.id]: http(),
        [anvil.id]: http('http://127.0.0.1:8545'),
      },
    }),
  )
