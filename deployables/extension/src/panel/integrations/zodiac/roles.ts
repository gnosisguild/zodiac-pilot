import { decodeRoleKey } from '@zodiac/modules'
import { jsonStringify, type MetaTransactionRequest } from '@zodiac/schema'
import type { PrefixedAddress } from 'ser-kit'
import { z } from 'zod'
import { getStorageEntry, saveStorageEntry } from '../../utils'

const rolesAppUrl = process.env.ROLES_APP_URL

const zRecord = z.object({
  id: z.string(),
  authToken: z.string(),
})
type Record = z.infer<typeof zRecord>

type RecordCallsQueueEntry = PromiseWithResolvers<void> & {
  transactions: MetaTransactionRequest[]
}

// This map holds an entry for each unique combination of { rolesMod, roleKey }.
// The key is generated as `${rolesMod}:${decodeRoleKey(roleKey)}`.
const recordCallsQueue = new Map<string, RecordCallsQueueEntry>()

/**
 * Record calls to the Zodiac Roles app, so the user can update their role's permissions.
 *
 * This function is a wrapper around `recordCallsSimple` that ensures no two invocations
 * with the same `{ rolesMod, roleKey }` run in parallel. If an invocation is already in
 * progress for a given key, any new call will be deferred and its `transactions` added to
 * the pending batch.
 *
 * When the current call finishes, all accumulated transactions for that key
 * will be processed in a single (batched) invocation of `recordCalls`.
 *
 * This serialization is necessary especially when initially creating a new calls record so
 * that now multiple records will be created for the same role.
 */
export async function recordCalls(
  transactions: MetaTransactionRequest[],
  { rolesMod, roleKey }: { rolesMod: PrefixedAddress; roleKey: string },
): Promise<void> {
  // Create a unique key for this { rolesMod, roleKey } combination.
  const key = `${rolesMod}:${decodeRoleKey(roleKey)}`

  // If there's already a queue entry for this key, simply append
  // the new transactions and return the pending promise.
  if (recordCallsQueue.has(key)) {
    const queueEntry = recordCallsQueue.get(key)!
    queueEntry.transactions.push(...transactions)
    return queueEntry.promise
  }

  // Create a new deferred using Promise.withResolvers.
  const deferred = Promise.withResolvers<void>()

  const queueEntry: RecordCallsQueueEntry = {
    transactions: [...transactions],
    ...deferred,
  }

  recordCallsQueue.set(key, queueEntry)

  // Process the queue asynchronously.
  ;(async () => {
    try {
      while (queueEntry.transactions.length > 0) {
        // Batch all pending transactions.
        const currentBatch = queueEntry.transactions
        // Clear out the transactions so new ones can be queued.
        queueEntry.transactions = []
        await recordCallsSimple(currentBatch, { rolesMod, roleKey })
      }
      // Resolve after all transactions are processed.
      queueEntry.resolve()
    } catch (error) {
      queueEntry.reject(error)
    } finally {
      // Clean up the queue entry for this key.
      recordCallsQueue.delete(key)
    }
  })()

  return deferred.promise
}

const recordCallsSimple = async (
  transactions: MetaTransactionRequest[],
  { rolesMod, roleKey }: { rolesMod: PrefixedAddress; roleKey: string },
) => {
  const entry = await getStorageEntry({
    key: `${rolesMod}:${decodeRoleKey(roleKey)}`,
  })

  if (entry) {
    return await recordSubsequentCalls(transactions, zRecord.parse(entry))
  }

  return await recordInitialCalls(transactions, {
    rolesMod,
    roleKey,
  })
}

const recordInitialCalls = async (
  transactions: MetaTransactionRequest[],
  { rolesMod, roleKey }: { rolesMod: PrefixedAddress; roleKey: string },
) => {
  const metadata = {
    recordedAt: new Date().toISOString(),
    recordedWith: 'Zodiac Pilot',
  }

  const response = await fetch(`${rolesAppUrl}/api/records`, {
    method: 'POST',
    body: jsonStringify(transactions.map((t) => ({ ...t, metadata }))),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const record = zRecord.parse(await response.json())

  await saveStorageEntry({
    key: `${rolesMod}:${decodeRoleKey(roleKey)}`,
    value: record,
  })
}

const recordSubsequentCalls = async (
  transactions: MetaTransactionRequest[],
  record: Record,
) => {
  const metadata = {
    recordedAt: new Date().toISOString(),
    recordedWith: 'Zodiac Pilot',
  }

  const response = await fetch(
    `${rolesAppUrl}/api/records/${record.id}/calls`,
    {
      method: 'POST',
      body: jsonStringify(transactions.map((t) => ({ ...t, metadata }))),
      headers: {
        Authorization: `Bearer ${record.authToken}`,
        'Content-Type': 'application/json',
      },
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error('Failed to record calls: ' + data.error)
  }
}
