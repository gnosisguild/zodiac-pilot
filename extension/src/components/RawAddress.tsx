import { PropsWithChildren } from 'react'

export const RawAddress = ({ children }: PropsWithChildren) => (
  <code className="bg-zodiac-dark-mustard max-w-full overflow-hidden text-ellipsis text-nowrap rounded-md border border-zodiac-light-mustard border-opacity-30 px-2 py-1 font-mono text-sm">
    {children}
  </code>
)
