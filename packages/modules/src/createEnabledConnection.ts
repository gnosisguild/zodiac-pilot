import { ConnectionType, type Connection, type PrefixedAddress } from 'ser-kit'

type EnabledConnection = Extract<
  Connection,
  { type: ConnectionType.IS_ENABLED }
>

export const createEnabledConnection = (
  from: PrefixedAddress,
): EnabledConnection => ({
  type: ConnectionType.IS_ENABLED,
  from,
})
