import classNames from 'classnames'
import {
  createContext,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ContextType,
} from 'react'
import { Link } from './Link'

const TableContext = createContext<{
  bleed: boolean
  dense: boolean
  grid: boolean
  striped: boolean
}>({
  bleed: false,
  dense: false,
  grid: false,
  striped: false,
})

export function Table({
  bleed = false,
  dense = false,
  grid = false,
  striped = false,
  className,
  children,
  ...props
}: {
  bleed?: boolean
  dense?: boolean
  grid?: boolean
  striped?: boolean
} & ComponentPropsWithoutRef<'div'>) {
  return (
    <TableContext value={{ bleed, dense, grid, striped }}>
      <div className="flow-root">
        <div
          {...props}
          className={classNames(
            className,
            '-mx-(--gutter) overflow-x-auto whitespace-nowrap',
          )}
        >
          <div
            className={classNames(
              'inline-block min-w-full align-middle',
              !bleed && 'sm:px-(--gutter)',
            )}
          >
            <table className="min-w-full text-left text-sm/6 text-zinc-950 dark:text-white">
              {children}
            </table>
          </div>
        </div>
      </div>
    </TableContext>
  )
}

export function TableHead({
  className,
  ...props
}: ComponentPropsWithoutRef<'thead'>) {
  return (
    <thead
      {...props}
      className={classNames(className, 'text-zinc-500 dark:text-zinc-400')}
    />
  )
}

export function TableBody(props: ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} />
}

const TableRowContext = createContext<{
  href?: string
  target?: string
  title?: string
}>({
  href: undefined,
  target: undefined,
  title: undefined,
})

export function TableRow({
  href,
  target,
  title,
  className,
  ...props
}: {
  href?: string
  target?: string
  title?: string
} & ComponentPropsWithoutRef<'tr'>) {
  const { striped } = useContext(TableContext)

  return (
    <TableRowContext.Provider
      value={{ href, target, title } as ContextType<typeof TableRowContext>}
    >
      <tr
        {...props}
        className={classNames(
          className,
          href &&
            'has-[[data-row-link][data-focus]]:outline-2 has-[[data-row-link][data-focus]]:-outline-offset-2 has-[[data-row-link][data-focus]]:outline-blue-500 dark:focus-within:bg-white/[2.5%]',
          striped && 'even:bg-zinc-950/[2.5%] dark:even:bg-white/[2.5%]',
          href && striped && 'hover:bg-zinc-950/5 dark:hover:bg-white/5',
          href &&
            !striped &&
            'hover:bg-zinc-950/[2.5%] dark:hover:bg-white/[2.5%]',
        )}
      />
    </TableRowContext.Provider>
  )
}

export function TableHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<'th'>) {
  const { bleed, grid } = useContext(TableContext)

  return (
    <th
      {...props}
      className={classNames(
        className,
        'first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) border-b border-b-zinc-950/10 px-4 py-2 font-medium dark:border-b-white/10',
        grid &&
          'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5',
        !bleed && 'sm:first:pl-1 sm:last:pr-1',
      )}
    />
  )
}

export function TableCell({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'td'>) {
  const { bleed, dense, grid, striped } = useContext(TableContext)
  const { href, target, title } = useContext(TableRowContext)
  const [cellRef, setCellRef] = useState<HTMLElement | null>(null)

  return (
    <td
      ref={href ? setCellRef : undefined}
      {...props}
      className={classNames(
        className,
        'first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) relative px-4',
        !striped && 'border-b border-zinc-950/5 dark:border-white/5',
        grid &&
          'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5',
        dense ? 'py-2.5' : 'py-4',
        !bleed && 'sm:first:pl-1 sm:last:pr-1',
      )}
    >
      {href && (
        <Link
          data-row-link
          to={href}
          target={target}
          aria-label={title}
          tabIndex={cellRef?.previousElementSibling === null ? 0 : -1}
          className="focus:outline-hidden absolute inset-0"
        />
      )}
      {children}
    </td>
  )
}
