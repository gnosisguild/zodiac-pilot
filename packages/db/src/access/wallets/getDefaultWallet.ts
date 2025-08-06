import { invariant } from '@epic-web/invariant'
import { ChainId } from '@zodiac/chains'
import { User } from '@zodiac/db/schema'
import { DBClient } from '../../dbClient'
import { findDefaultWallet } from './findDefaultWallet'

export const getDefaultWallet = async (
  db: DBClient,
  user: User,
  chainId: ChainId,
) => {
  const wallet = await findDefaultWallet(db, user, chainId)

  invariant(
    wallet != null,
    `User with id "${user.id}" does not have a default wallet for chain "${chainId}"`,
  )

  return wallet
}
