import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

export const Table = ({ children }: PropsWithChildren) => (
  <table className="w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-md border border-zinc-700">
    {children}
  </table>
)

const THead = ({ children }: PropsWithChildren) => <thead>{children}</thead>

Table.THead = THead

const TBody = ({ children }: PropsWithChildren) => <tbody>{children}</tbody>

Table.TBody = TBody

const Tr = ({ children }: PropsWithChildren) => (
  <tr className="group">{children}</tr>
)

Table.Tr = Tr

type Align = 'left' | 'center' | 'right'

type ThProps = PropsWithChildren<{ align?: Align }>

const Th = ({ children, align = 'left' }: ThProps) => (
  <th
    className={classNames(
      'border-b-2 border-zinc-700 px-2',
      align === 'left' && 'text-left',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
    )}
  >
    {children}
  </th>
)

Table.Th = Th

type TdProps = PropsWithChildren<{
  align?: Align
  noWrap?: boolean
}>

const Td = ({ children, align = 'left', noWrap = false }: TdProps) => (
  <td
    className={classNames(
      'border-b border-zinc-700 px-2 py-1 text-sm text-white/75 transition-all group-last:border-b-0 group-hover:bg-zinc-900 group-hover:text-white',
      align === 'left' && 'text-left',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',

      noWrap && 'whitespace-nowrap',
    )}
  >
    {children}
  </td>
)

Table.Td = Td
