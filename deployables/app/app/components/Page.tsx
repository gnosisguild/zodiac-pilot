import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

type PageProps = PropsWithChildren<{ fullWidth?: boolean }>

export const Page = ({ children, fullWidth = false }: PageProps) => {
  return (
    <div className="bg-radial-[at_100%_100%] flex flex-1 flex-shrink-0 flex-col overflow-y-auto from-white to-zinc-50 dark:from-gray-900 dark:to-zinc-950">
      <div
        className={classNames(
          'mx-16 mt-16 flex flex-1 flex-col',
          fullWidth === false && 'xl:w-3/5 2xl:w-2/5',
        )}
      >
        {children}
      </div>
    </div>
  )
}

const Header = ({ children }: PropsWithChildren) => (
  <h1 className="leading-0 mb-16 text-3xl font-extralight">{children}</h1>
)

Page.Header = Header

const Main = ({ children }: PropsWithChildren) => (
  <main role="main" className="flex flex-1 flex-col gap-4 pb-16">
    {children}
  </main>
)

Page.Main = Main
