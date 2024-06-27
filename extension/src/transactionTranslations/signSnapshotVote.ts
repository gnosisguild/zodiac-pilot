import { Interface } from '@ethersproject/abi'
import { MetaTransaction } from 'react-multisend'

// https://github.com/gnosisguild/snapshot-signer
const SNAPSHOT_SIGNER_ADDRESS = '0xa58Cf66d0f14AEFb2389c6998f6ad219dd4885c1'

const SnapshotSignerInterface = new Interface([
  'function signSnapshotArrayVote(tuple(address from, string space, uint64 timestamp, bytes32 proposal, uint32[] choice, string reason, string app, string metadata) vote, tuple(string name, string version) domain)',
  'function signSnapshotStringVote(tuple(address from, string space, uint64 timestamp, bytes32 proposal, string choice, string reason, string app, string metadata) vote, tuple(string name, string version) domain)',
  'function signSnapshotVote(tuple(address from, string space, uint64 timestamp, bytes32 proposal, uint32 choice, string reason, string app, string metadata) vote, tuple(string name, string version) domain)',
])

// This is not strictly a transaction translation but a similar concept: Given the parameters of an eth_signTypedData_v4 call, it return a meta transaction for producing the signature through the snapshot-signer adapter contract.
// If the signature is not for a snapshot vote, it returns undefined.
export const translateSignSnapshotVote = (params: {
  domain?: Domain
  message?: any
  types?: Record<string, Type[]>
  primaryType?: string
}): MetaTransaction | undefined => {
  const { domain, message, types, primaryType } = params
  if (domain?.name !== 'snapshot') return undefined
  if (primaryType !== 'Vote' || !types?.Vote) return undefined

  const choiceType = types.Vote?.find((t) => t.name === 'choice')?.type

  let data: string
  switch (choiceType) {
    case 'uint32':
      // default single choice vote
      data = SnapshotSignerInterface.encodeFunctionData('signSnapshotVote', [
        message,
        domain,
      ])
      break
    case 'uint32[]':
      // multiple choice / array vote
      data = SnapshotSignerInterface.encodeFunctionData(
        'signSnapshotArrayVote',
        [message, domain]
      )
      break
    case 'string':
      typedDataHash
      // string vote
      data = SnapshotSignerInterface.encodeFunctionData(
        'signSnapshotStringVote',
        [message, domain]
      )
      break
    default:
      console.warn(`Unsupported vote choice type: ${choiceType}`)
      return undefined
  }

  return {
    to: SNAPSHOT_SIGNER_ADDRESS,
    value: '0',
    data,
    operation: 1,
  }
}

interface Domain {
  name?: string
  version?: string
}

interface Type {
  name: string
  type: string
}
