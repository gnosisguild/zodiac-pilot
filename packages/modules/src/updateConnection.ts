import { type ChainId } from '@zodiac/chains'
import type { Connection, HexAddress } from '@zodiac/schema'
import { unprefixAddress } from 'ser-kit'
import { updatePrefixedAddress } from './updatePrefixedAddress'

type UpdateConnectionOptions = {
  chainId?: ChainId
  from?: HexAddress
}

export const updateConnection = <T extends Connection>(
  connection: T,
  { from = unprefixAddress(connection.from), chainId }: UpdateConnectionOptions,
): T => ({
  ...connection,

  from: updatePrefixedAddress(connection.from, { chainId, address: from }),
})
