import type { Account } from '@zodiac/db/schema'
import type { UUID } from 'crypto'

export type PartialAccount = Pick<Account, 'label' | 'address' | 'chainId'> & {
  id: UUID | string
}
