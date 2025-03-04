import { TextInput } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import { useLocation } from 'react-router'

export const FakeBrowser = ({ children }: PropsWithChildren) => {
  const { search } = useLocation()

  const searchParams = new URLSearchParams(search)

  if (!searchParams.has('screenshot')) {
    return children
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="relative flex items-center justify-center border-b border-zinc-300 bg-zinc-200 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-3">
          <div className="size-3 rounded-full bg-slate-400 dark:bg-zinc-500" />
          <div className="size-3 rounded-full bg-slate-400 dark:bg-zinc-500" />
          <div className="size-3 rounded-full bg-slate-400 dark:bg-zinc-500" />
        </div>

        <div className="relative w-1/4">
          <TextInput
            hideLabel
            label="Location"
            textAlign="center"
            defaultValue={
              typeof window === 'undefined' ? '' : window.location.host
            }
          />
        </div>
      </div>
      {children}
    </div>
  )
}
