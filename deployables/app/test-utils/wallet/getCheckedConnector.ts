import type { Config } from 'wagmi'

export const getCheckedConnector = (config: Config) => {
  const [connector] = config.connectors

  if (connector.type !== 'mock') {
    console.warn(
      "You're not using a mock connector for wagmi. This is probably not what you want.",
    )
  }

  return connector
}
