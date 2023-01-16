import {
  CallContractTransactionInput,
  TransactionInput,
  TransactionType,
} from 'react-multisend'

export const canTranslateTransactionInput = (
  input: TransactionInput
): boolean => {
  // if it's a raw transaction, we can't translate it
  if (input.type !== TransactionType.callContract) return false

  // we only support uniswap v3 multicall for now
  if (input.functionSignature !== 'multicall(uint256,bytes[])') return false

  return true
}

export const translateTransactionInput = (
  input: CallContractTransactionInput
): Array<TransactionInput> => {
  if (!canTranslateTransactionInput(input)) {
    throw new Error('Cannot translate transaction input')
  }

  if (!(input.inputValues?.data instanceof Array)) return [input]

  const transactionInputs = input.inputValues.data.map((callData) => {
    return {
      type: TransactionType.raw,
      to: input.to,
      value: input.value,
      data: callData.toString(),
    } as TransactionInput
  })
  return transactionInputs
}

export default translateTransactionInput
