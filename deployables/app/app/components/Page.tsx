import classNames from 'classnames'
import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactNode,
} from 'react'

const PageContext = createContext(false)

const useFullWidth = () => useContext(PageContext)

type PageProps = PropsWithChildren<{ fullWidth?: boolean }>

export const Page = ({ children, fullWidth = false }: PageProps) => {
  return (
    <div className="bg-radial-[at_100%_100%] flex flex-1 flex-shrink-0 flex-col overflow-y-auto from-white to-zinc-50 dark:from-gray-900 dark:to-zinc-950">
      <div className="mt-16">
        <PageContext value={fullWidth}>{children}</PageContext>
      </div>
    </div>
  )
}

const Header = ({
  children,
  action,
}: PropsWithChildren<{ action?: ReactNode }>) => (
  <Boundary>
    <div className="mb-16 flex items-center justify-between">
      <h1 className="leading-0 text-3xl font-extralight">{children}</h1>

      {action}
    </div>
  </Boundary>
)

Page.Header = Header

const Main = ({ children }: PropsWithChildren) => (
  <Boundary>
    <main role="main" className="flex flex-1 flex-col gap-4 pb-16">
      {children}
    </main>
  </Boundary>
)

Page.Main = Main

const Boundary = ({ children }: PropsWithChildren) => (
  <div
    className={classNames(
      'mx-16 flex flex-1 flex-col',
      useFullWidth() === false && 'xl:w-3/5 2xl:w-2/5',
    )}
  >
    {children}
  </div>
)
