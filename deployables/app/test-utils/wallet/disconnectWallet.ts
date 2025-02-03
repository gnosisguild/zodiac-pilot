import { getWagmiConfig } from '@/wagmi'
import { disconnect } from '@wagmi/core'
import { sleepTillIdle } from '@zodiac/test-utils'
import { getCheckedConnector } from './getCheckedConnector'
import { getCheckedWagmiConfig } from './getCheckedWagmiConfig'

export const disconnectWallet = async () => {
  const config = await getCheckedWagmiConfig()

  console.log('BEFORE DISCONNECT', config.state)

  await disconnect(getWagmiConfig(true), {
    connector: getCheckedConnector(config),
  })

  console.log('AFTER DISCONNECT', config.state)

  await sleepTillIdle()
}
