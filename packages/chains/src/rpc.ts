export const rpc = (chainId: number) =>
  new URL(`${chainId}`, 'https://rpc.zodiacos.io')
