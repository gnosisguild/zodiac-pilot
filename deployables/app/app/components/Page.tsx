import { PilotType, ZodiacOsPlain } from '@zodiac/ui'
import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

type PageProps = PropsWithChildren<{ fullWidth?: boolean }>

export const Page = ({ children, fullWidth = false }: PageProps) => {
  return (
    <div className="bg-linear-to-b flex flex-1 flex-shrink-0 flex-col overflow-y-auto from-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-gray-900">
      <div
        className={classNames(
          'mx-16 mt-16 flex flex-1 flex-col',
          fullWidth === false && 'mx-auto w-3/4 px-1 md:w-1/2 2xl:w-2/5',
        )}
      >
        {children}
      </div>
    </div>
  )
}

const Header = ({ children }: PropsWithChildren) => (
  <header className="mb-16 flex flex-col gap-6">
    <div className="flex items-center gap-2">
      <ZodiacOsPlain className="h-6 lg:h-4" />
      <PilotType className="h-8 lg:h-5 dark:invert" />
    </div>

    <h1 className="leading-0 text-3xl font-extralight">{children}</h1>
  </header>
)

Page.Header = Header

const Main = ({ children }: PropsWithChildren) => (
  <main role="main" className="flex flex-1 flex-col gap-4 pb-16">
    {children}
  </main>
)

Page.Main = Main
