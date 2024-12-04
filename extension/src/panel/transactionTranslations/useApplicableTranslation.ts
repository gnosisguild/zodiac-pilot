import { getChainId } from '@/chains'
import { useExecutionRoute } from '@/execution-routes'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useDispatch, useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { useCallback, useEffect, useState } from 'react'
import { ChainId, parsePrefixedAddress } from 'ser-kit'
import {
  ApplicableTranslation,
  applicableTranslationsCache,
} from './applicableTranslationCache'
import { translations } from './translations'

export const useApplicableTranslation = (transactionIndex: number) => {
  const provider = useProvider()
  const transactions = useTransactions()
  const metaTransaction = transactions[transactionIndex].transaction

  const dispatch = useDispatch()
  const { avatar } = useExecutionRoute()
  const [_, avatarAddress] = parsePrefixedAddress(avatar)

  const [translation, setTranslation] = useState<
    ApplicableTranslation | undefined
  >(undefined)

  const apply = useCallback(
    async (translation: ApplicableTranslation) => {
      const transactionState = transactions[transactionIndex]
      const laterTransactions = transactions
        .slice(transactionIndex + 1)
        .map((txState) => txState.transaction)

      invariant(
        provider instanceof ForkProvider,
        'Transaction translation is only supported when using ForkProvider'
      )

      // remove the transaction and all later ones from the store
      dispatch({
        type: 'REMOVE_TRANSACTION',
        payload: { id: transactionState.id },
      })

      // revert to checkpoint before the transaction to remove
      const checkpoint = transactionState.snapshotId // the ForkProvider uses checkpoints as IDs for the recorded transactions
      await provider.request({ method: 'evm_revert', params: [checkpoint] })

      // re-simulate all transactions starting with the translated ones
      const replayTransaction = [...translation.result, ...laterTransactions]
      for (const tx of replayTransaction) {
        provider.sendMetaTransaction(tx)
      }
    },
    [provider, dispatch, transactions, transactionIndex]
  )

  const chainId = getChainId(avatar)

  useEffect(() => {
    let canceled = false
    const run = async () => {
      const translation = await findApplicableTranslation(
        metaTransaction,
        chainId,
        avatarAddress
      )
      if (canceled) return

      if (translation?.autoApply) {
        apply(translation)
      } else {
        setTranslation(translation)
      }
    }
    run()
    return () => {
      canceled = true
    }
  }, [metaTransaction, chainId, avatarAddress, apply])

  return translation && !translation.autoApply
    ? {
        title: translation.title,
        result: translation.result,
        apply: () => apply(translation),
      }
    : undefined
}

const findApplicableTranslation = async (
  metaTransaction: MetaTransactionData,
  chainId: ChainId,
  avatarAddress: `0x${string}`
): Promise<ApplicableTranslation | undefined> => {
  // we cache the result of the translation to avoid test-running translation functions over and over again
  const key = cacheKey(metaTransaction, chainId, avatarAddress)
  if (applicableTranslationsCache.has(key)) {
    return await applicableTranslationsCache.get(key)
  }

  const tryApplyingTranslations = async () => {
    for (const translation of translations) {
      if (!('translate' in translation)) continue
      const result = await translation.translate(
        metaTransaction,
        chainId,
        avatarAddress
      )
      if (result) {
        return {
          title: translation.title,
          autoApply: translation.autoApply,
          result,
        }
        break
      }
    }
  }
  const resultPromise = tryApplyingTranslations()
  applicableTranslationsCache.set(key, resultPromise)

  return await resultPromise
}

const cacheKey = (
  transaction: MetaTransactionData,
  chainId: ChainId,
  avatarAddress: `0x${string}`
) =>
  `${chainId}:${avatarAddress}:${transaction.to}:${transaction.value}:${transaction.data}:${
    transaction.operation || 0
  }`
