import type { Account } from '@zodiac/schema'
import { Address, Popover } from '@zodiac/ui'
import classNames from 'classnames'
import { MoveDown, MoveRight } from 'lucide-react'
import { Children, cloneElement, type ReactElement } from 'react'
import {
  AccountType,
  splitPrefixedAddress,
  type Connection as SerConnection,
} from 'ser-kit'
import { useChain } from './ChainContext'
import { Connection } from './Connection'
import { useOrientation } from './Routes'

type WaypointsProps = {
  children: ReactElement<WaypointProps>[]
}

export const Waypoints = ({ children }: WaypointsProps) => {
  const size = Children.count(children)

  const orientation = useOrientation()

  if (size === 0) {
    return null
  }

  return (
    <ol
      className={classNames(
        'flex flex-1 items-center gap-4',
        orientation === 'vertical' && 'flex-col overflow-hidden',
      )}
    >
      {Children.map(children, (child, index) => (
        <>
          <Connection
            account={child.props.account}
            connection={child.props.connection}
          >
            {orientation === 'vertical' ? (
              <MoveDown size={16} />
            ) : (
              <MoveRight size={16} />
            )}
          </Connection>

          {cloneElement(child, {
            ...child.props,
            highlight: index === 0 || index === size - 1,
          })}
        </>
      ))}
    </ol>
  )
}

type WaypointProps = {
  account: Account
  connection?: SerConnection
  highlight?: boolean
}

export const Waypoint = ({ account, highlight = false }: WaypointProps) => {
  const [chainId] = splitPrefixedAddress(account.prefixedAddress)
  const chain = useChain(chainId)

  return (
    <li
      className={classNames(
        'flex w-full flex-col items-center gap-2 rounded border border-zinc-500 bg-zinc-100 px-2 py-4 dark:border-zinc-400/75 dark:bg-zinc-950',
        highlight === false && 'border-dashed',
      )}
    >
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase">
        {chain && chain.logo_url && (
          <Popover
            position="top"
            popover={
              <span className="text-xs font-semibold uppercase">
                {chain.name}
              </span>
            }
          >
            <img src={chain.logo_url} alt={chain.name} className="size-4" />
          </Popover>
        )}

        <AccountName account={account} />
      </h3>

      <Address shorten size="small">
        {account.address}
      </Address>
    </li>
  )
}

const AccountName = ({ account }: { account: Account }) => {
  if (account.type === AccountType.ROLES) {
    return `${account.type} v${account.version}`
  }

  return account.type
}
