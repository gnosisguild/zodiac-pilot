import { PropsWithChildren } from 'react'

export const RawAddress = ({ children }: PropsWithChildren) => (
  <code className="max-w-full overflow-hidden text-ellipsis text-nowrap rounded-md border border-zodiac-light-mustard border-opacity-30 bg-zodiac-dark-mustard px-2 py-1 font-mono">
    {children}
  </code>
)
