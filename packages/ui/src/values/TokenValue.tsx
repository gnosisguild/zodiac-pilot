import type { ReactNode } from 'react'
import { NumberValue } from './NumberValue'

type TokenValueProps = {
  action?: ReactNode
  symbol?: string | null
  children: string
  balanceDiff?: number
}

export const TokenValue = ({
  children,
  action,
  symbol,

  balanceDiff,
}: TokenValueProps) => {
  const textColor =
    balanceDiff == null
      ? 'group-hover:text-indigo-800 dark:group-hover:text-teal-500 text-gray-600'
      : balanceDiff > 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400'

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`text-xs font-semibold uppercase opacity-75 ${textColor}`}
      >
        {symbol}
      </span>

      <NumberValue
        precision={4}
        className={textColor}
        additionalInfo={
          balanceDiff && (
            <span className="tabular-numbs text-sm slashed-zero">
              {balanceDiff} {symbol}
            </span>
          )
        }
      >
        {parseFloat(children)}
      </NumberValue>

      {action}
    </span>
  )
}
