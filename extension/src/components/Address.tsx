import { PropsWithChildren } from 'react'

export const Address = ({ children }: PropsWithChildren) => (
  <code className="max-w-full overflow-hidden text-ellipsis text-nowrap rounded-md border border-zinc-300 bg-zinc-100 px-2 py-1 font-mono text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50">
    {children}
  </code>
)
