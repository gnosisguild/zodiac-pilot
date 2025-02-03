import { connect } from '@wagmi/core'
import { sleepTillIdle } from '@zodiac/test-utils'
import { getCheckedConnector } from './getCheckedConnector'
import { getCheckedWagmiConfig } from './getCheckedWagmiConfig'

export const connectWallet = async () => {
  const config = await getCheckedWagmiConfig()
  const connector = getCheckedConnector(config)

  const connectResult = await connect(config, { connector })

  await sleepTillIdle()

  return { ...connectResult, connector, config }
}
