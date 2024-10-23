import { PropsWithChildren } from 'react'

export const Circle = ({ children }: PropsWithChildren) => (
  <div className="relative flex size-12 flex-shrink-0 items-center justify-center rounded-full border border-zodiac-dark-green">
    {children}
  </div>
)
