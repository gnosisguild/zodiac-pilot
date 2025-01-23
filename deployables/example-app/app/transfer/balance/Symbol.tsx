import type { PropsWithChildren } from 'react'

export const Symbol = ({ children }: PropsWithChildren) => (
  <span className="rounded-sm bg-blue-100 px-1 text-xs font-semibold uppercase tabular-nums text-blue-500">
    {children}
  </span>
)
