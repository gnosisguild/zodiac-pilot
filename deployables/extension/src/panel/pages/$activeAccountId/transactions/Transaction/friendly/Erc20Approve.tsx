import { useTransaction, type UnconfirmedTransaction } from '@/transactions'
import { invariant } from '@epic-web/invariant'
import type { HexAddress } from '@zodiac/schema'
import { Address, GhostButton, TokenValue } from '@zodiac/ui'
import { SquarePen } from 'lucide-react'
import { decodeFunctionData, erc20Abi, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'

export const isApplicable = (transaction: UnconfirmedTransaction) => {
  try {
    // Try to decode the transaction data as an ERC20 approve function
    const decoded = decodeFunctionData({
      abi: erc20Abi,
      data: transaction.data,
    })

    // Check if the decoded function name is 'approve'
    return decoded.functionName === 'approve'
  } catch {
    // If decoding fails, it's not an ERC20 approve transaction
    return false
  }
}

export const Title = ({ transactionId }: { transactionId: string }) => {
  const transaction = useTransaction(transactionId)

  const decoded = decodeFunctionData({
    abi: erc20Abi,
    data: transaction.data,
  })
  invariant(
    decoded.functionName === 'approve',
    'Transaction is not an ERC20 approve',
  )
  const [spenderAddress, approvalAmount] = decoded.args

  const { symbol = 'tokens', decimals = 0 } = useTokenInfo(transaction.to)
  const truncatedSpender = `${spenderAddress.slice(0, 6)}...${spenderAddress.slice(-4)}`

  return (
    <div>
      Approve {compactAmount(approvalAmount, decimals)} {symbol} to{' '}
      {truncatedSpender}
    </div>
  )
}

export const Body = ({ transactionId }: { transactionId: string }) => {
  const transaction = useTransaction(transactionId)

  const decoded = decodeFunctionData({
    abi: erc20Abi,
    data: transaction.data,
  })
  invariant(
    decoded.functionName === 'approve',
    'Transaction is not an ERC20 approve',
  )
  const [spenderAddress, approvalAmount] = decoded.args

  const { symbol = 'tokens', decimals = 0 } = useTokenInfo(transaction.to)
  const formattedAmount = formatUnits(approvalAmount, decimals) as `${number}`

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-gray-600 dark:text-gray-400">
        <div>
          Spender: <Address>{spenderAddress as HexAddress}</Address>
        </div>
        <TokenValue
          symbol={symbol}
          action={
            <GhostButton iconOnly size="small" icon={SquarePen}>
              Edit approve amount
            </GhostButton>
          }
        >
          {formattedAmount}
        </TokenValue>
      </div>
    </div>
  )
}

const useTokenInfo = (address: `0x${string}`) => {
  const { data, error } = useReadContracts({
    contracts: [
      {
        address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'name',
      },
    ],
  })

  if (error) {
    console.error(error)
  }

  const symbol = data?.[0]?.result
  const decimals = data?.[1]?.result
  const name = data?.[2]?.result

  return { symbol, decimals, name }
}

const MAX_UINT256 = (1n << 256n) - 1n
const THRESHOLD = (MAX_UINT256 * 99n) / 100n

const compactAmount = (amount: bigint, decimals: number) => {
  if (amount >= THRESHOLD) {
    return '∞'
  }

  const floatAmount = parseFloat(formatUnits(amount, decimals))

  // Use Intl.NumberFormat for compact notation (1.4k, 524k, 1.5M, etc.)
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  }).format(floatAmount)
}
