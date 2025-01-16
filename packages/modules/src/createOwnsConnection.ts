import { ConnectionType, type Connection, type PrefixedAddress } from 'ser-kit'

type OwnsConnection = Extract<Connection, { type: ConnectionType.OWNS }>

export const createOwnsConnection = (
  from: PrefixedAddress,
): OwnsConnection => ({
  type: ConnectionType.OWNS,
  from,
})
