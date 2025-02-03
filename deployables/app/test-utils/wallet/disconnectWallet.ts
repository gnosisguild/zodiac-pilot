import { getWagmiConfig } from '@/wagmi'
import { disconnect } from '@wagmi/core'
import { sleepTillIdle } from '@zodiac/test-utils'
import { getCheckedConnector } from './getCheckedConnector'
import { getCheckedWagmiConfig } from './getCheckedWagmiConfig'

export const disconnectWallet = async () => {
  const config = await getCheckedWagmiConfig()

  console.log('ON', config.state)

  await disconnect(getWagmiConfig(true), {
    connector: getCheckedConnector(config),
  })

  console.log('OFF', config.state)

  await sleepTillIdle()
}
