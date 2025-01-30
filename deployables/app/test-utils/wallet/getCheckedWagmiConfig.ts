import { getWagmiConfig } from '@/wagmi'
import { vi } from 'vitest'

export const getCheckedWagmiConfig = async () => {
  const { getWagmiConfig: originalGetWagmiConfig } =
    await vi.importActual<typeof import('@/wagmi')>('@/wagmi')

  const isMockedConfig = originalGetWagmiConfig !== getWagmiConfig

  if (!isMockedConfig) {
    console.warn(
      'You did not mock your wagmi config. You probably want to do that in tests to control which accounts connect.',
    )
  }

  return getWagmiConfig(true)
}
