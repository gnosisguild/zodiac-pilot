import { invariant } from '@epic-web/invariant'
import { useStableHandler } from '@zodiac/hooks'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { findActiveAccount } from './findActiveAccount'
import { getAccount } from './getAccount'

type OnLaunchOptions = {
  onActivate?: (accountId: string, tabId?: number) => void
}

export const useActivateAccount = ({ onActivate }: OnLaunchOptions = {}) => {
  const navigate = useNavigate()
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null)
  const onActivateRef = useStableHandler(onActivate)

  const activateAccount = useCallback(
    async (accountId: string, tabId?: number) => {
      const activeAccount = await findActiveAccount()

      if (activeAccount != null) {
        const newAccount = await getAccount(accountId)

        if (
          prefixAddress(activeAccount.chainId, activeAccount.address) !==
          prefixAddress(newAccount.chainId, newAccount.address)
        ) {
          setPendingAccountId(accountId)

          return
        }
      }

      if (onActivateRef.current != null) {
        onActivateRef.current(accountId, tabId)
      }

      navigate(`/${accountId}`)
    },
    [onActivateRef, navigate],
  )

  const cancelActivation = useCallback(() => setPendingAccountId(null), [])

  const proceedWithActivation = useCallback(async () => {
    const activeAccount = await findActiveAccount()

    setPendingAccountId(null)

    invariant(pendingAccountId != null, 'No route launch was pending')

    if (onActivateRef.current != null) {
      onActivateRef.current(pendingAccountId)
    }

    if (activeAccount == null) {
      navigate(`/${pendingAccountId}`)
    } else {
      navigate(`/${activeAccount.id}/clear-transactions/${pendingAccountId}`)
    }
  }, [navigate, onActivateRef, pendingAccountId])

  return [
    activateAccount,
    {
      isActivationPending: pendingAccountId != null,
      cancelActivation,
      proceedWithActivation,
    },
  ] as const
}
