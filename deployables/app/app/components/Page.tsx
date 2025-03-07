import classNames from 'classnames'
import { type PropsWithChildren, type ReactNode } from 'react'

type PageProps = PropsWithChildren<{ fullWidth?: boolean }>

export const Page = ({ children }: PageProps) => {
  return children
}

const Header = ({
  children,
  action,
}: PropsWithChildren<{ action?: ReactNode }>) => (
  <div className="mb-16 flex items-center justify-between">
    <h1 className="text-3xl font-extralight">{children}</h1>

    {action}
  </div>
)

Page.Header = Header

const Main = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={classNames('flex flex-col gap-4 pb-16', className)}>
    {children}
  </div>
)

Page.Main = Main
