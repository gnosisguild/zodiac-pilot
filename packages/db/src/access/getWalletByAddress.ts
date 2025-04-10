import { invariant } from '@epic-web/invariant'
import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../dbClient'
import type { User } from '../schema'
import { findWalletByAddress } from './findWalletByAddress'

export const getWalletByAddress = async (
  db: DBClient,
  user: User,
  address: HexAddress,
) => {
  const wallet = await findWalletByAddress(db, user, address)

  invariant(
    wallet != null,
    `User with id "${user.id}" does not own a wallet with address "${address}"`,
  )

  return wallet
}
