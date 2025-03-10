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
  color: 'teal' | 'indigo' | 'amber' | 'blue'
}>

const Item = ({ icon: Icon, title, children, color }: ItemsProps) => (
  <div className="relative pl-9">
    <dt className="inline font-semibold text-zinc-900 dark:text-zinc-50">
      <Icon
        className={classNames(
          'absolute left-1 top-1 size-5',
          color === 'teal' && 'text-teal-700 dark:text-teal-500',
          color === 'indigo' && 'text-indigo-700 dark:text-indigo-500',
          color === 'amber' && 'text-amber-700 dark:text-amber-500',
          color === 'blue' && 'text-blue-700 dark:text-blue-500',
        )}
      />
      {title}
    </dt>{' '}
    <dd className="inline text-zinc-800 dark:text-zinc-200">{children}</dd>
  </div>
)

Description.Item = Item
