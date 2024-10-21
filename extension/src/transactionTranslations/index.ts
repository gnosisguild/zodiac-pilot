import { useCallback, useEffect, useState } from 'react'
import { ChainId, parsePrefixedAddress } from 'ser-kit'

import { useRoute } from '../routes'

import cowswapSetPreSignature from './cowswapSetPreSignature'
import { TransactionTranslation } from './types'
import uniswapMulticall from './uniswapMulticall'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import kpkBridgeAware from './karpatkeyInstitutional/kpkBridgeAware'
import { useDispatch, useTransactions } from '../state'
import { useProvider } from '../browser/ProvideProvider'
import { ForkProvider } from '../providers'

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

export const useApplicableTranslation = (transactionIndex: number) => {
  const provider = useProvider()
  const transactions = useTransactions()

  const dispatch = useDispatch()
  const { chainId, route } = useRoute()
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
        transactions[transactionIndex].transaction,
        chainId,
        avatarAddress,
        transactions.map((txState) => txState.transaction)
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
  }, [transactions, transactionIndex, chainId, avatarAddress, apply])

  return (
    translation && {
      title: translation.title,
      result: translation.result,
      apply: () => apply(translation),
    }
  )
}

const findApplicableTranslation = async (
  transaction: MetaTransactionData,
  chainId: ChainId,
  avatarAddress: `0x${string}`,
  allTransactions: MetaTransactionData[]
): Promise<ApplicableTranslation | undefined> => {
  // we cache the result of the translation to avoid test-running translation functions over and over again
  const key = cacheKey(transaction, chainId, avatarAddress)
  if (applicableTranslationsCache.has(key)) {
    return await applicableTranslationsCache.get(key)
  }

  const tryApplyingTranslations = async () => {
    for (const translation of translations) {
      const result = await translation.translate(
        transaction,
        chainId,
        avatarAddress,
        allTransactions
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
