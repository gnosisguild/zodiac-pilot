import {
  getAccount,
  getActiveRoute,
  toLocalAccount,
  toRemoteAccount,
  type TaggedAccount,
} from '@/accounts'
import { toAccount } from '@/companion'
import { saveRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  useTabMessageHandler,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { useStableHandler } from '@zodiac/ui'
import { useCallback, useState } from 'react'
import { useRevalidator } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { useActivateAccount } from './useActivateAccount'

type UseSaveOptions = {
  onSave?: (route: ExecutionRoute, tabId: number) => void
}

export const useSaveRoute = (
  lastUsedAccountId: string | null,
  { onSave }: UseSaveOptions = {},
) => {
  const transactions = useTransactions()
  const { revalidate } = useRevalidator()
  const [pendingUpdate, setPendingUpdate] = useState<{
    incomingRoute: ExecutionRoute
    incomingAccount: TaggedAccount
    tabId: number
  } | null>(null)
  const [launchRoute, launchOptions] = useActivateAccount({
    onActivate: async (accountId, tabId) => {
      if (onSaveRef.current) {
        invariant(tabId != null, `tabId was not provided to launchRoute`)

        onSaveRef.current(await getActiveRoute(accountId), tabId)
      }
    },
  })

  const onSaveRef = useStableHandler(onSave)

  useTabMessageHandler(
    [
      CompanionAppMessageType.SAVE_ROUTE,
      CompanionAppMessageType.SAVE_AND_LAUNCH,
    ],
    async (message, { tabId }) => {
      const [incomingAccount, incomingRoute] =
        await getIncomingAccountAndRoute(message)

      if (
        lastUsedAccountId != null &&
        lastUsedAccountId === incomingAccount.id &&
        transactions.length > 0
      ) {
        const currentAccount = await getAccount(lastUsedAccountId)

        if (
          prefixAddress(currentAccount.chainId, currentAccount.address) !==
          prefixAddress(incomingAccount.chainId, incomingAccount.address)
        ) {
          setPendingUpdate({ incomingRoute, incomingAccount, tabId })

          return
        }
      }

      if (
        incomingAccount.remote &&
        message.type === CompanionAppMessageType.SAVE_AND_LAUNCH
      ) {
        launchRoute(incomingAccount.id, tabId)

        return
      }

      saveRoute(incomingRoute).then(() => {
        revalidate()

        if (message.type === CompanionAppMessageType.SAVE_AND_LAUNCH) {
          launchRoute(incomingAccount.id, tabId)
        } else {
          if (onSaveRef.current) {
            onSaveRef.current(incomingRoute, tabId)
          }
        }
      })
    },
  )

  const cancelUpdate = useCallback(() => setPendingUpdate(null), [])

  const saveUpdate = useCallback(async () => {
    invariant(
      pendingUpdate != null,
      'Tried to save a route when no save was pending',
    )

    const { incomingRoute, tabId } = pendingUpdate

    setPendingUpdate(null)

    await saveRoute(incomingRoute)

    if (onSaveRef.current) {
      onSaveRef.current(incomingRoute, tabId)
    }

    return incomingRoute
  }, [onSaveRef, pendingUpdate])

  return [
    {
      isUpdatePending: pendingUpdate != null,
      cancelUpdate,
      saveUpdate,
    },
    launchOptions,
  ] as const
}

const getIncomingAccountAndRoute = async (
  message: CompanionAppMessage,
): Promise<[account: TaggedAccount, route: ExecutionRoute]> => {
  if (message.type === CompanionAppMessageType.SAVE_ROUTE) {
    return [toLocalAccount(toAccount(message.data)), message.data]
  }

  if (message.type === CompanionAppMessageType.SAVE_AND_LAUNCH) {
    if (message.account != null) {
      return [
        toRemoteAccount(message.account),
        await getActiveRoute(message.account.id),
      ]
    }

    return [toLocalAccount(toAccount(message.data)), message.data]
  }

  throw new Error(`Cannot retrieve route from "${message.type}" messages`)
}
