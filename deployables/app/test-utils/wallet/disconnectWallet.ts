import { getWagmiConfig } from '@/wagmi'
import { disconnect } from '@wagmi/core'
import { sleepTillIdle } from '@zodiac/test-utils'
import { getCheckedConnector } from './getCheckedConnector'
import { getCheckedWagmiConfig } from './getCheckedWagmiConfig'

export const disconnectWallet = async () => {
  const config = await getCheckedWagmiConfig()

  await disconnect(getWagmiConfig(true), {
    connector: getCheckedConnector(config),
  })

  await sleepTillIdle()
}
