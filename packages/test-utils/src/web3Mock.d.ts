declare module '@depay/web3-mock' {
  type Web3Mock = {
    trigger: (event: string, data: unknown) => void
    mock: (options: {
      accounts: { return: string[] }
      blockchain: string
      wallet?: string
    }) => void
  }

  const Web3Mock: Web3Mock

  export const mock: Web3Mock['mock']
  export const trigger: Web3Mock['trigger']
}
