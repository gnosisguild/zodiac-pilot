import { ForwardedRef, forwardRef, PropsWithChildren } from 'react'
import { Divider } from './Divider'

export const Page = ({ children }: PropsWithChildren) => (
  <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
)

const Header = ({ children }: PropsWithChildren) => (
  <>
    <div className="flex flex-col p-4">{children}</div>

    <Divider />
  </>
)

Page.Header = Header

const Content = (
  { children }: PropsWithChildren,
  ref: ForwardedRef<HTMLDivElement>
) => (
  <div ref={ref} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
    {children}
  </div>
)

Page.Content = forwardRef(Content)

const Footer = ({ children }: PropsWithChildren) => (
  <div className="flex flex-col gap-4 border-t border-zinc-400/80 bg-zinc-100 p-4 dark:border-gray-700/80 dark:bg-gray-950/80">
    {children}
  </div>
)

Page.Footer = Footer
