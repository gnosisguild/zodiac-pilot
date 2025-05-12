import { verifyHexAddress, type HexAddress } from '@zodiac/schema'
import type { Log } from 'viem'

/**
 * Processes an array of transfer logs and updates the deltas record with the amounts transferred to the specified address.
 *
 * @param logs - An array of log objects representing transfer events.
 * @param address - The target address (avatar address) to check for incoming transfers.
 * @param deltas - A record object where the keys are token addresses and the values are the accumulated transfer amounts.
 *
 * @returns The updated deltas record with the amounts transferred to the specified address.
 */
export const processTransferLogs = (
  currentDeltas: Record<HexAddress, bigint>,
  logs: Log[],
  address: HexAddress, //avatar address
): Record<HexAddress, bigint> =>
  logs.reduce((newDeltas, log) => {
    const [topic] = log.topics

    if (topic !== ERC20_TRANSFER_TOPIC) {
      return newDeltas
    }

    const { to, from, value } = decodeTransferLog(log)
    const token = verifyHexAddress(log.address)
    const amount = BigInt(value)

    if (to.toLowerCase() === address.toLowerCase()) {
      // Avatar receives tokens => increase delta
      return { ...newDeltas, [token]: (newDeltas[token] ?? 0n) + amount }
    }

    if (from.toLowerCase() === address.toLowerCase()) {
      // Avatar sends tokens => decrease delta
      return {
        ...newDeltas,
        [token]: (newDeltas[token] = (newDeltas[token] ?? 0n) - amount),
      }
    }

    return newDeltas
  }, currentDeltas)

export const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const decodeTransferLog = (log: Log) => {
  const from = '0x' + (log.topics[1]?.slice(26) || '')
  const to = '0x' + (log.topics[2]?.slice(26) || '')
  const valueHex = log.data

  if (log.data === '0x') {
    return { from, to, value: 0n.toString() }
  }

  const value = BigInt(valueHex).toString()
  return { from, to, value }
}
