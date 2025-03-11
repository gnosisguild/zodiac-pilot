import type { PropsWithChildren } from 'react'

export const Stats = ({ children }: PropsWithChildren) => (
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </dl>
  </div>
)

const Stat = ({ name, children }: PropsWithChildren<{ name: string }>) => (
  <div className="mx-auto flex max-w-xs flex-col gap-y-4">
    <dt className="text-base/7 text-gray-600">{name}</dt>
    <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
      {children}
    </dd>
  </div>
)

Stats.Stat = Stat
