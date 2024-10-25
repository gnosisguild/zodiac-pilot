import { useZodiacRoute } from '@/zodiac-routes'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { useCallback, useEffect, useState } from 'react'
import { ChainId, parsePrefixedAddress } from 'ser-kit'
import cowswapSetPreSignature from './cowswapSetPreSignature'
import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'
import kpkBridgeAware from './karpatkeyInstitutional/kpkBridgeAware'
import { TransactionState, useDispatch, useTransactions } from '../state'
import { useProvider, ForkProvider } from '@/provider'

// ADD ANY NEW TRANSLATIONS TO THIS ARRAY
const translations: TransactionTranslation[] = [
  uniswapMulticall,
  cowswapSetPreSignature,
  kpkBridgeAware,
]

interface ApplicableTranslation {
  /** Title of the applied translation (TransactionTranslation.title) */
  title: string
  /** If true, the translation will be applied automatically. By default translations will be suggested to the user who then applies them by clicking a button **/
  autoApply?: boolean
  /** The translation result (return value of TransactionTranslation.translate) */
  result: MetaTransactionData[]
}

export const useGloballyApplicableTranslation = () => {
  const provider = useProvider()
  const transactions = useTransactions()

  const dispatch = useDispatch()
  const { chainId, route } = useZodiacRoute()
  const [_, avatarAddress] = parsePrefixedAddress(route.avatar)

  const apply = useCallback(
    async (translation: ApplicableTranslation) => {
      if (!(provider instanceof ForkProvider)) {
        throw new Error(
          'Transaction translation is only supported when using ForkProvider'
        )
      }

      const newTransactions = translation.result
      const firstDifferenceIndex = transactions.findIndex(
        (tx, index) =>
          !transactionsEqual(tx.transaction, newTransactions[index])
      )

      if (
        firstDifferenceIndex === -1 &&
        newTransactions.length === transactions.length
      ) {
        console.warn(
          'Global translations returned the original set of transactions. It should return undefined in that case.'
        )
        return
      }

      if (firstDifferenceIndex !== -1) {
        // remove all transactions from the store starting at the first difference
        dispatch({
          type: 'REMOVE_TRANSACTION',
          payload: { id: transactions[firstDifferenceIndex].id },
        })

        // revert to checkpoint before first difference
        const checkpoint = transactions[firstDifferenceIndex].snapshotId // the ForkProvider uses checkpoints as IDs for the recorded transactions
        await provider.request({ method: 'evm_revert', params: [checkpoint] })
      }

      // re-simulate all transactions starting at the first difference
      const replayTransaction =
        firstDifferenceIndex === -1
          ? newTransactions.slice(transactions.length)
          : newTransactions.slice(firstDifferenceIndex)
      for (const tx of replayTransaction) {
        provider.sendMetaTransaction(tx)
      }
    },
    [provider, dispatch, transactions]
  )

  useEffect(() => {
    let canceled = false
    const run = async () => {
      const translation = await findGloballyApplicableTranslation(
        transactions,
        chainId,
        avatarAddress
      )
      if (canceled) return

      if (translation?.autoApply) {
        apply(translation)
      } else {
        throw new Error('Not implemented')
      }
    }
    run()
    return () => {
      canceled = true
    }
  }, [transactions, chainId, avatarAddress, apply])
}

const findGloballyApplicableTranslation = async (
  transactions: TransactionState[],
  chainId: ChainId,
  avatarAddress: `0x${string}`
): Promise<ApplicableTranslation | undefined> => {
  if (transactions.length === 0) return undefined

  // we cache the result of the translation to avoid test-running translation functions over and over again
  const key = cacheKeyGlobal(transactions, chainId, avatarAddress)
  if (applicableTranslationsCache.has(key)) {
    return await applicableTranslationsCache.get(key)
  }

  const tryApplyingTranslations = async () => {
    for (const translation of translations) {
      if (!('translateGlobal' in translation)) continue
      const result = await translation.translateGlobal(
        transactions.map((txState) => txState.transaction),
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

export const useApplicableTranslation = (transactionIndex: number) => {
  const provider = useProvider()
  const transactions = useTransactions()
  const metaTransaction = transactions[transactionIndex].transaction

  const dispatch = useDispatch()
  const { chainId, route } = useZodiacRoute()
  const [_, avatarAddress] = parsePrefixedAddress(route.avatar)

  const [translation, setTranslation] = useState<
    ApplicableTranslation | undefined
  >(undefined)

  const apply = useCallback(
    async (translation: ApplicableTranslation) => {
      const transactionState = transactions[transactionIndex]
      const laterTransactions = transactions
        .slice(transactionIndex + 1)
        .map((txState) => txState.transaction)

      if (!(provider instanceof ForkProvider)) {
        throw new Error(
          'Transaction translation is only supported when using ForkProvider'
        )
      }

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

const applicableTranslationsCache = new Map<
  string,
  Promise<ApplicableTranslation | undefined>
>()

const cacheKey = (
  transaction: MetaTransactionData,
  chainId: ChainId,
  avatarAddress: `0x${string}`
) =>
  `${chainId}:${avatarAddress}:${transaction.to}:${transaction.value}:${transaction.data}:${
    transaction.operation || 0
  }`

const cacheKeyGlobal = (
  transactions: TransactionState[],
  chainId: ChainId,
  avatarAddress: `0x${string}`
) => `${chainId}:${avatarAddress}:${transactions.map((tx) => tx.id).join(',')}`

const transactionsEqual = (a: MetaTransactionData, b: MetaTransactionData) =>
  a.to.toLowerCase() === b.to.toLowerCase() &&
  (a.value || '0' === b.value || '0') &&
  a.data === b.data &&
  (a.operation || 0 === b.operation || 0)
