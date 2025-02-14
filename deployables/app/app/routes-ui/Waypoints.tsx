import type { Account } from '@zodiac/schema'
import { Address } from '@zodiac/ui'
import { Children, type ReactElement } from 'react'
import { AccountType, type Connection as SerConnection } from 'ser-kit'
import { Connection } from './Connection'

export const Waypoints = ({
  children,
}: {
  children: ReactElement<WaypointProps>[]
}) => {
  if (Children.count(children) === 0) {
    return null
  }

  return (
    <ul className="flex flex-1 flex-col items-center gap-4">
      {Children.map(children, (child) => (
        <>
          <Connection
            account={child.props.account}
            connection={child.props.connection}
          />

          {child}
        </>
      ))}
    </ul>
  )
}

type WaypointProps = { account: Account; connection?: SerConnection }

export const Waypoint = ({ account }: WaypointProps) => (
  <li className="flex w-full flex-col items-center gap-1 rounded border border-zinc-300 bg-zinc-100 p-2 dark:border-zinc-600/75 dark:bg-zinc-950">
    <h3 className="text-xs font-semibold uppercase opacity-75">
      <AccountName account={account} />
    </h3>

    <Address shorten size="small">
      {account.address}
    </Address>
  </li>
)

const AccountName = ({ account }: { account: Account }) => {
  if (account.type === AccountType.ROLES) {
    return `${account.type} v${account.version}`
  }

  return account.type
}
