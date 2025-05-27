import {
  findActiveRoute,
  getAccount,
  toLocalAccount,
  toRemoteAccount,
  type TaggedAccount,
} from '@/accounts'
import { toAccount } from '@/companion'
import { saveRoute } from '@/execution-routes'
import { useTransactions } from '@/transactions'
import { invariant } from '@epic-web/invariant'
import { useStableHandler } from '@zodiac/hooks'
import {
  CompanionAppMessageType,
  useTabMessageHandler,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { useCallback, useState } from 'react'
import { useRevalidator } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { useActivateAccount } from './useActivateAccount'

type UseSaveOptions = {
  onSave?: (route: ExecutionRoute | null, tabId: number) => void
}

export const useSaveRoute = (
  lastUsedAccountId: string | null,
  { onSave }: UseSaveOptions = {},
) => {
  const transactions = useTransactions()
  const { revalidate } = useRevalidator()
  const [pendingUpdate, setPendingUpdate] = useState<{
    incomingRoute: ExecutionRoute | null
    incomingAccount: TaggedAccount
    tabId: number
  } | null>(null)
  const [launchRoute, launchOptions] = useActivateAccount({
    onActivate: async (accountId, tabId) => {
      if (onSaveRef.current) {
        invariant(tabId != null, `tabId was not provided to launchRoute`)

        onSaveRef.current(await findActiveRoute(accountId), tabId)
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

      invariant(
        incomingRoute != null,
        'Cannot save and/or launch route because no active route is defined',
      )

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

    const { incomingRoute, incomingAccount, tabId } = pendingUpdate

    setPendingUpdate(null)

    if (!incomingAccount.remote) {
      invariant(
        incomingRoute != null,
        'Incoming account is local but does not define a route',
      )

      await saveRoute(incomingRoute)
    }

    if (onSaveRef.current) {
      onSaveRef.current(incomingRoute, tabId)
    }

    return incomingAccount
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
): Promise<[account: TaggedAccount, route: ExecutionRoute | null]> => {
  if (message.type === CompanionAppMessageType.SAVE_ROUTE) {
    return [toLocalAccount(toAccount(message.data)), message.data]
  }

  if (message.type === CompanionAppMessageType.SAVE_AND_LAUNCH) {
    if (message.account != null) {
      return [
        toRemoteAccount(message.account),
        await findActiveRoute(message.account.id),
      ]
    }

    return [toLocalAccount(toAccount(message.data)), message.data]
  }

  throw new Error(`Cannot retrieve route from "${message.type}" messages`)
}
