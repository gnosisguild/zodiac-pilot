import type { PropsWithChildren } from 'react'

type TokenValueProps = PropsWithChildren

export const TokenValue = ({ children }: TokenValueProps) => (
  <span className="slashed-zero tabular-nums">{children}</span>
)
