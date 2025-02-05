import type { PropsWithChildren, ReactNode } from 'react'

type TokenValueProps = PropsWithChildren<{
  action?: ReactNode
  symbol?: string | null
}>

export const TokenValue = ({ children, action, symbol }: TokenValueProps) => (
  <span className="inline-flex items-center gap-2">
    <span className="text-xs font-semibold uppercase opacity-75 group-hover:text-indigo-800 dark:group-hover:text-teal-400 dark:group-hover:text-teal-500">
      {symbol}
    </span>

    <span className="slashed-zero tabular-nums">{children}</span>

    {action}
  </span>
)
