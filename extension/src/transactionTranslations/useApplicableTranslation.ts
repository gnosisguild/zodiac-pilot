import { useEffect, useState } from 'react'
import { MetaTransaction } from 'react-multisend'

import { TransactionTranslation } from './types'

import { findApplicableTranslation } from '.'

export const useApplicableTranslation = (
  encodedTransaction: MetaTransaction
) => {
  const [translationAvailable, setTranslationAvailable] = useState<boolean>()
  const [translation, setTranslation] = useState<
    TransactionTranslation | undefined
  >(undefined)

  useEffect(() => {
    const isFindApplicableTranslation = async () => {
      const translationResult = await findApplicableTranslation(
        encodedTransaction
      )
      setTranslationAvailable(!!translationResult)
      setTranslation(translationResult)
    }
    isFindApplicableTranslation().catch(console.error)
  }, [encodedTransaction])

  return { translationAvailable, translation }
}
