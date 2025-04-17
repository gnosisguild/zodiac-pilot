import { invariant } from '@epic-web/invariant'
import type { Params } from 'react-router'

export const getActiveAccountId = (params: Params) => {
  const { activeAccountId } = params

  invariant(activeAccountId != null, 'No "activeAccountId" found in params')

  return activeAccountId
}
