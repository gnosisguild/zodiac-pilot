import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

export const Routes = ({ children }: PropsWithChildren) => (
  <ul className="flex gap-1">{children}</ul>
)

type RouteProps = PropsWithChildren<{
  selectable?: boolean
  selected?: boolean
  onSelect?: () => void
}>

export const Route = ({
  children,
  selected = false,
  selectable = true,
  onSelect,
}: RouteProps) => {
  return (
    <li className="flex snap-start list-none flex-col items-center">
      <button
        className={classNames(
          'flex w-44 justify-center rounded-md border py-2 outline-none',

          selectable &&
            'cursor-pointer px-2 hover:border-indigo-500 hover:bg-indigo-500/10 focus:border-indigo-500 focus:bg-indigo-500/10 dark:hover:border-teal-500 dark:hover:bg-teal-500/10 dark:focus:border-teal-500 dark:focus:bg-teal-500/10',
          selected
            ? 'border-indigo-500 bg-indigo-500/10 dark:border-teal-500 dark:bg-teal-500/10'
            : 'border-transparent',
        )}
        onClick={() => {
          if (selectable === false) {
            return
          }

          if (onSelect != null) {
            onSelect()
          }
        }}
      >
        {children}
      </button>
    </li>
  )
}
