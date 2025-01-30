import { connect } from '@wagmi/core'
import { getCheckedConnector } from './getCheckedConnector'
import { getCheckedWagmiConfig } from './getCheckedWagmiConfig'

export const connectWallet = async () => {
  const config = await getCheckedWagmiConfig()
  const connector = getCheckedConnector(config)

  const connectResult = await connect(config, { connector })

  return { ...connectResult, connector, config }
}
