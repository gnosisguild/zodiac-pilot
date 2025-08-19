import { ZERO_ADDRESS } from '@zodiac/chains'
import { verifyHexAddress, type HexAddress } from '@zodiac/schema'
import { decodeAbiParameters, type Log } from 'viem'

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

    let transfer: Transfer
    switch (topic) {
      case ERC20_TRANSFER_TOPIC:
        transfer = decodeTransferLog(log)
        break
      case TENDERLY_ADD_ERC20_BALANCE_TOPIC:
        transfer = decodeAddErc20BalanceLog(log)
        break
      default:
        return newDeltas
    }

    const { from, to, value, token } = transfer
    if (to.toLowerCase() === address.toLowerCase()) {
      // Avatar receives tokens => increase delta
      return { ...newDeltas, [token]: (newDeltas[token] ?? 0n) + value }
    }

    if (from.toLowerCase() === address.toLowerCase()) {
      // Avatar sends tokens => decrease delta
      return {
        ...newDeltas,
        [token]: (newDeltas[token] = (newDeltas[token] ?? 0n) - value),
      }
    }

    return newDeltas
  }, currentDeltas)

export const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export const TENDERLY_ADD_ERC20_BALANCE_TOPIC =
  '0x6b63b18d9192abd17d691fc20cdd4e217201dcaec063e9a17bf1b479fea63591'

type Transfer = {
  from: HexAddress
  to: HexAddress
  value: bigint
  token: HexAddress
}

const decodeTransferLog = (log: Log): Transfer => {
  return {
    from: verifyHexAddress('0x' + (log.topics[1]?.slice(26) || '')),
    to: verifyHexAddress('0x' + (log.topics[2]?.slice(26) || '')),
    value: log.data === '0x' ? 0n : BigInt(log.data),
    token: verifyHexAddress(log.address),
  }
}

const decodeAddErc20BalanceLog = (log: Log): Transfer => {
  const [token, , value, , to] = decodeAbiParameters(
    [
      { name: 'token', type: 'address' },
      { name: '_param1', type: 'uint256' },
      { name: 'value', type: 'uint256' },
      { name: '_param3', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    log.data,
  )

  return {
    from: ZERO_ADDRESS,
    to: verifyHexAddress(to),
    value: value,
    token: verifyHexAddress(token),
  }
}
