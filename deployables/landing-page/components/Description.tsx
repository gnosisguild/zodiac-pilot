import classNames from 'classnames'
import type { LucideIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'

export const Description = ({ children }: PropsWithChildren) => (
  <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-zinc-200 lg:max-w-none">
    {children}
  </dl>
)

type ItemsProps = PropsWithChildren<{
  title: string
  icon: LucideIcon
  color: 'teal' | 'indigo' | 'amber' | 'pink'
}>

const Item = ({ icon: Icon, title, children, color }: ItemsProps) => (
  <div className="relative flex flex-col pl-9">
    <dt className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
      <Icon
        className={classNames(
          'absolute left-1 top-1 size-5',
          color === 'teal' && 'text-teal-700 dark:text-teal-500',
          color === 'indigo' && 'text-indigo-700 dark:text-indigo-500',
          color === 'amber' && 'text-amber-700 dark:text-amber-500',
          color === 'pink' && 'text-pink-700 dark:text-pink-500',
        )}
      />
      {title}
    </dt>
    <dd className="text-sm text-zinc-800 dark:text-zinc-300">{children}</dd>
  </div>
)

Description.Item = Item
