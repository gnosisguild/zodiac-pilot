import type { PropsWithChildren, ReactNode } from 'react'

type TokenValueProps = PropsWithChildren<{ action?: ReactNode }>

export const TokenValue = ({ children, action }: TokenValueProps) => (
  <span className="inline-flex items-center gap-2 slashed-zero tabular-nums">
    {children}

    {action}
  </span>
)
