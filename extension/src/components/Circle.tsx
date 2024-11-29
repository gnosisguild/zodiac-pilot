import { PropsWithChildren } from 'react'

export const Circle = ({ children }: PropsWithChildren) => (
  <div className="relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-green-900 p-1">
    {children}
  </div>
)
