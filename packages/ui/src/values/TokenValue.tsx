import type { ReactNode } from 'react'
import { NumberValue } from './NumberValue'

type TokenValueProps = {
  action?: ReactNode
  symbol?: string | null
  children: string
}

export const TokenValue = ({ children, action, symbol }: TokenValueProps) => (
  <span className="inline-flex items-center gap-2">
    <span className="text-xs font-semibold uppercase opacity-75 group-hover:text-indigo-800 dark:group-hover:text-teal-400 dark:group-hover:text-teal-500">
      {symbol}
    </span>

    <NumberValue precision={4}>{parseFloat(children)}</NumberValue>

    {action}
  </span>
)
