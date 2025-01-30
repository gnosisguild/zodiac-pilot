import { connect } from '@wagmi/core'
import { getCheckedConnector } from './getCheckedConnector'
import { getCheckedWagmiConfig } from './getCheckedWagmiConfig'

export const connectWallet = async () => {
  const config = await getCheckedWagmiConfig()

  await connect(config, { connector: getCheckedConnector(config) })
}
