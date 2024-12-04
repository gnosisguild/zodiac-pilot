import { CHAIN_CURRENCY, getChainId } from '@/chains'
import { Address, Divider, ToggleButton } from '@/components'
import { useExecutionRoute } from '@/execution-routes'
import { TransactionState } from '@/state'
import { ExecutionRoute } from '@/types'
import { formatEther, Fragment } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import { AccountType } from 'ser-kit'
import { ContractAddress } from './ContractAddress'
import { CopyToClipboard } from './CopyToClipboard'
import { DecodedTransaction } from './DecodedTransaction'
import { RawTransaction } from './RawTransaction'
import { Remove } from './Remove'
import { RolePermissionCheck } from './RolePermissionCheck'
import { SimulationStatus } from './SimulationStatus'
import { Translate } from './Translate'
import { useDecodedFunctionData } from './useDecodedFunctionData'

interface Props {
  transactionState: TransactionState
  index: number
  scrollIntoView: boolean
}

export const Transaction = ({
  index,
  transactionState,
  scrollIntoView,
}: Props) => {
  const [expanded, setExpanded] = useState(true)
  const route = useExecutionRoute()
  const chainId = getChainId(route.avatar)
  const elementRef = useScrollIntoView(scrollIntoView)

  const decoded = useDecodedFunctionData(transactionState)

  const showRoles = routeGoesThroughRoles(route)

  return (
    <div
      ref={elementRef}
      className="flex flex-col rounded-md border border-zinc-300/80 dark:border-zinc-500/60"
    >
      <div className="bg-zinc-100/80 p-2 dark:bg-zinc-500/20">
        <TransactionHeader
          index={index}
          transactionState={transactionState}
          functionFragment={decoded?.functionFragment}
          expanded={expanded}
          onExpandToggle={() => setExpanded(!expanded)}
          showRoles={showRoles}
        />
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-zinc-300 bg-zinc-200/80 px-2 py-4 text-sm dark:border-zinc-500/80 dark:bg-zinc-500/30">
          <div className="flex justify-between gap-4">
            <ContractAddress
              chainId={chainId}
              address={transactionState.transaction.to}
              contractInfo={transactionState.contractInfo}
            />

            <EtherValue value={transactionState.transaction.value} />
          </div>

          <Divider />

          <TransactionStatus
            transactionState={transactionState}
            index={index}
            showRoles={showRoles}
          />

          {decoded ? (
            <DecodedTransaction {...decoded} />
          ) : (
            <RawTransaction data={transactionState.transaction.data} />
          )}
        </div>
      )}
    </div>
  )
}

interface HeaderProps {
  index: number
  transactionState: TransactionState
  functionFragment?: Fragment
  onExpandToggle(): void
  expanded: boolean
  showRoles?: boolean
}

const TransactionHeader = ({
  index,
  transactionState,
  functionFragment,
  onExpandToggle,
  expanded,
  showRoles = false,
}: HeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <label className="flex w-3/5 cursor-pointer items-center gap-2">
        <ToggleButton expanded={expanded} onToggle={onExpandToggle} />

        <h5 className="flex flex-col gap-1 text-sm font-semibold">
          {functionFragment
            ? functionFragment.format('sighash').split('(')[0]
            : 'Raw transaction'}

          {transactionState.transaction.operation === 1 && (
            <span className="text-xs font-normal uppercase opacity-75">
              delegatecall
            </span>
          )}
        </h5>
      </label>
      <div className="flex items-center justify-end gap-2">
        <SimulationStatus transactionState={transactionState} mini />
        {showRoles && (
          <RolePermissionCheck
            transactionState={transactionState}
            index={index}
            mini
          />
        )}
        <div className="flex">
          <Translate index={index} />
          <CopyToClipboard transaction={transactionState.transaction} />
          <Remove transactionState={transactionState} index={index} />
        </div>
      </div>
    </div>
  )
}

interface StatusProps {
  transactionState: TransactionState
  showRoles?: boolean
  index: number
}

const TransactionStatus = ({
  transactionState,
  index,
  showRoles = false,
}: StatusProps) => (
  <>
    <SimulationStatus transactionState={transactionState} />

    {showRoles && (
      <>
        <Divider />

        <RolePermissionCheck
          transactionState={transactionState}
          index={index}
        />
      </>
    )}
  </>
)

type EtherValueProps = { value: string }

const EtherValue = ({ value }: EtherValueProps) => {
  const { avatar } = useExecutionRoute()
  const chainId = getChainId(avatar)

  return (
    <div className="flex flex-col gap-2 whitespace-nowrap text-xs">
      <div className="font-bold">
        Amount <span className="font-normal">({CHAIN_CURRENCY[chainId]})</span>
      </div>

      <div className="flex flex-1 justify-end">
        <Address>{formatEther(value || 0)}</Address>
      </div>
    </div>
  )
}

const useScrollIntoView = (enable: boolean) => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!enable || !elementRef.current) return

    const scrollParent = getScrollParent(elementRef.current)
    if (!scrollParent) return

    // scroll to it right away
    elementRef.current.scrollIntoView({
      behavior: 'smooth',
    })

    // keep it in view while it grows
    const resizeObserver = new ResizeObserver(() => {
      elementRef.current?.scrollIntoView({
        behavior: 'smooth',
      })

      // this delay must be greater than the browser's native scrollIntoView animation duration
      window.setTimeout(() => {
        scrollParent.addEventListener('scroll', stopObserving)
      }, 1000)
    })
    resizeObserver.observe(elementRef.current)

    // stop keeping it in view once the user scrolls
    const stopObserving = () => {
      resizeObserver.disconnect()
      scrollParent.removeEventListener('scroll', stopObserving)
    }

    return () => {
      stopObserving()
    }
  }, [enable])
  return elementRef
}

function getScrollParent(node: Element | null): Element | null {
  if (node === null) {
    return null
  }

  if (node.scrollHeight > node.clientHeight) {
    return node
  } else {
    return getScrollParent(node.parentElement)
  }
}

const routeGoesThroughRoles = (route: ExecutionRoute) =>
  route.waypoints?.some(
    (waypoint) => waypoint.account.type === AccountType.ROLES
  )