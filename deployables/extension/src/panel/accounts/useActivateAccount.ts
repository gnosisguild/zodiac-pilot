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
  const [pendingUpdate, setPendingUpdate] = useState<{
    accountId: string
    tabId?: number
  } | null>(null)
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
          setPendingUpdate({ accountId, tabId })

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

  const cancelActivation = useCallback(() => setPendingUpdate(null), [])

  const proceedWithActivation = useCallback(async () => {
    const activeAccount = await findActiveAccount()

    setPendingUpdate(null)

    invariant(pendingUpdate != null, 'No route launch was pending')

    if (onActivateRef.current != null) {
      onActivateRef.current(pendingUpdate.accountId, pendingUpdate.tabId)
    }

    if (activeAccount == null) {
      navigate(`/${pendingUpdate.accountId}`)
    } else {
      navigate(
        `/${activeAccount.id}/clear-transactions/${pendingUpdate.accountId}`,
      )
    }
  }, [navigate, onActivateRef, pendingUpdate])

  return [
    activateAccount,
    {
      isActivationPending: pendingUpdate != null,
      cancelActivation,
      proceedWithActivation,
    },
  ] as const
}
