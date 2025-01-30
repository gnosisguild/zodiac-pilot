import { getWagmiConfig } from '@/wagmi'
import { connect } from '@wagmi/core'
import { vi } from 'vitest'

export const connectWallet = async () => {
  const { getWagmiConfig: originalGetWagmiConfig } =
    await vi.importActual<typeof import('@/wagmi')>('@/wagmi')

  const isMockedConfig = originalGetWagmiConfig !== getWagmiConfig

  if (!isMockedConfig) {
    console.warn(
      'You did not mock your wagmi config. You probably want to do that in tests to control which accounts connect.',
    )
  }

  const config = getWagmiConfig(true)

  const [connector] = config.connectors

  if (connector.type !== 'mock') {
    console.warn(
      "You're not using a mock connector for wagmi. This is probably not what you want.",
    )
  }

  await connect(config, { connector })
}
