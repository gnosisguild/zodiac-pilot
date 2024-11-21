import { PropsWithChildren } from 'react'

export const RawAddress = ({ children }: PropsWithChildren) => (
  <code className="max-w-full overflow-hidden text-ellipsis text-nowrap rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 font-mono">
    {children}
  </code>
)
