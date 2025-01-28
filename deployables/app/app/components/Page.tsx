import { PilotType, ZodiacOsPlain } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'

export const Page = ({ children }: PropsWithChildren) => {
  return (
    <div className="bg-linear-to-b flex flex-1 flex-shrink-0 overflow-y-auto from-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-gray-900">
      <div className="mx-auto flex w-3/4 flex-col px-1 md:w-1/2 2xl:w-2/5">
        {children}
      </div>
    </div>
  )
}

const Header = ({ children }: PropsWithChildren) => (
  <header className="my-16 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <ZodiacOsPlain className="h-6 lg:h-8" />
      <PilotType className="h-8 lg:h-10 dark:invert" />
    </div>

    <h1 className="text-3xl font-extralight">{children}</h1>
  </header>
)

Page.Header = Header

const Main = ({ children }: PropsWithChildren) => (
  <main role="main" className="flex flex-1 flex-col gap-4 pb-16">
    {children}
  </main>
)

Page.Main = Main
