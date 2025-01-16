import { getChainId, type ChainId } from '@zodiac/chains'
import type { Connection, HexAddress } from '@zodiac/schema'
import { parsePrefixedAddress } from 'ser-kit'
import { updatePrefixedAddress } from './updatePrefixedAddress'

type UpdateConnectionOptions = {
  chainId?: ChainId
  from?: HexAddress
}

export const updateConnection = <T extends Connection>(
  connection: T,
  {
    from = parsePrefixedAddress(connection.from),
    chainId = getChainId(connection.from),
  }: UpdateConnectionOptions,
): T => ({
  ...connection,

  from: updatePrefixedAddress(connection.from, { chainId, address: from }),
})
