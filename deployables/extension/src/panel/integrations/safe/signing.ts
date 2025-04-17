import type { HexAddress } from '@/types'
import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import {
  Contract,
  hashMessage as ethersHashMessage,
  toUtf8String,
  TypedDataEncoder,
} from 'ethers'
import type { MetaTransactionRequest } from 'ser-kit'

const SIGN_MESSAGE_LIB_ADDRESS = '0xd53cd0ab83d845ac265be939c57f53ad838012c9'
const SIGN_MESSAGE_LIB_ABI = [
  'function signMessage(bytes calldata _data)',
  'function getMessageHash(bytes memory message) public view returns (bytes32)',
]

const signMessageLib = new Contract(
  SIGN_MESSAGE_LIB_ADDRESS,
  SIGN_MESSAGE_LIB_ABI,
)

export const signMessage = (message: string): MetaTransactionRequest => ({
  to: SIGN_MESSAGE_LIB_ADDRESS,
  data: signMessageLib.interface.encodeFunctionData('signMessage', [
    hashMessage(message),
  ]) as HexAddress,
  value: 0n,
  operation: 1,
})

export const typedDataHash = (data: EIP712TypedData): string => {
  // We need to remove EIP712Domain from the types object since ethers does not like it
  const { EIP712Domain: _, ...types } = data.types

  return TypedDataEncoder.hash(data.domain as any, types, data.message)
}

export const signTypedData = (
  data: EIP712TypedData,
): MetaTransactionRequest => {
  return {
    to: SIGN_MESSAGE_LIB_ADDRESS,
    data: signMessageLib.interface.encodeFunctionData('signMessage', [
      typedDataHash(data),
    ]) as HexAddress,
    value: 0n,
    operation: 1,
  }
}

export const hashMessage = (message: string) =>
  ethersHashMessage(decode(message))

const decode = (message: string): string => {
  if (!message.startsWith('0x')) {
    return message
  }

  try {
    return toUtf8String(message)
  } catch {
    return message
  }
}
