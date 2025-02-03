import { connect } from '@wagmi/core'
import { sleepTillIdle } from '@zodiac/test-utils'
import { getCheckedConnector } from './getCheckedConnector'
import { getCheckedWagmiConfig } from './getCheckedWagmiConfig'

export const connectWallet = async () => {
  const config = await getCheckedWagmiConfig()
  const connector = getCheckedConnector(config)

  connector.uid = 'test-id'

  connector.emitter.on('disconnect', () => console.log('DISCONNECT EVENT'))

  const connectResult = await connect(config, { connector })

  console.log('AFTER CONNET', config.state)

  await sleepTillIdle()

  return { ...connectResult, connector, config }
}
