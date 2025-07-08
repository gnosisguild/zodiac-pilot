// for now we just use hard-coding
export const getVnetApiUrl = (protocol: 'https' | 'wss' = 'https') => {
  return `${protocol}://vnet.pilot.gnosisguild.org`
}
