import { useAccount } from '@/accounts'
import { useExecutionRoute } from '@/execution-routes'
import { useTransaction } from '@/state'
import type { ExecutionRoute } from '@/types'
import { CHAIN_CURRENCY } from '@zodiac/chains'
import { CopyToClipboard, Divider, TextInput, ToggleButton } from '@zodiac/ui'
import { formatEther, Fragment } from 'ethers'
import { useState, type PropsWithChildren } from 'react'
import { AccountType } from 'ser-kit'
import { ContractAddress } from './ContractAddress'
import { DecodedTransaction } from './DecodedTransaction'
import { RawTransaction } from './RawTransaction'
import { Remove } from './Remove'
import { RolePermissionCheck } from './RolePermissionCheck'
import { SimulationStatus } from './SimulationStatus'
import { Translate } from './Translate'
import { useDecodedFunctionData } from './useDecodedFunctionData'

interface Props {
  transactionId: string
}

export const Transaction = ({ transactionId }: Props) => {
  const transaction = useTransaction(transactionId)
  const [expanded, setExpanded] = useState(true)
  const { chainId } = useAccount()
  const route = useExecutionRoute()
  const decoded = useDecodedFunctionData(transactionId)
  const showRoles = routeGoesThroughRoles(route)

  return (
    <section
      aria-labelledby={transaction.id}
      className="flex flex-col rounded-md border border-zinc-300/80 dark:border-zinc-500/60"
    >
      <div className="bg-zinc-100/80 p-2 dark:bg-zinc-500/20">
        <TransactionHeader
          transactionId={transactionId}
          isDelegateCall={transaction.operation === 1}
          functionFragment={decoded?.functionFragment}
          expanded={expanded}
          onExpandToggle={() => setExpanded(!expanded)}
        >
          <SimulationStatus transactionId={transactionId} mini />

          {showRoles && (
            <RolePermissionCheck transactionId={transactionId} mini />
          )}

          <div className="flex">
            <Translate mini transactionId={transactionId} />
            <CopyToClipboard iconOnly size="small" data={transaction}>
              Copy transaction data to clipboard
            </CopyToClipboard>
            <Remove transactionId={transactionId} />
          </div>
        </TransactionHeader>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-zinc-300 bg-zinc-200/80 px-2 py-4 text-sm dark:border-zinc-500/80 dark:bg-zinc-500/30">
          <ContractAddress
            chainId={chainId}
            address={transaction.to}
            contractInfo={transaction.contractInfo}
          />

          <EtherValue value={transaction.value} />

          {decoded ? (
            <DecodedTransaction {...decoded}>
              <Divider />
            </DecodedTransaction>
          ) : (
            <>
              <Divider />

              <RawTransaction data={transaction.data} />
            </>
          )}

          <Divider />

          <TransactionStatus
            transactionId={transactionId}
            showRoles={showRoles}
          />
        </div>
      )}
    </section>
  )
}

type HeaderProps = PropsWithChildren<{
  transactionId: string
  functionFragment?: Fragment
  onExpandToggle(): void
  expanded: boolean
  isDelegateCall: boolean
}>

const TransactionHeader = ({
  transactionId,
  isDelegateCall,
  functionFragment,
  onExpandToggle,
  expanded,
  children,
}: HeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="flex cursor-pointer items-center gap-2 overflow-hidden">
        <ToggleButton expanded={expanded} onToggle={onExpandToggle} />

        <div className="flex flex-col gap-1 overflow-hidden">
          <h5
            id={transactionId}
            className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold"
          >
            {functionFragment
              ? functionFragment.format('sighash').split('(')[0]
              : 'Raw transaction'}
          </h5>

          {isDelegateCall && (
            <span className="text-xs font-normal uppercase opacity-75">
              delegatecall
            </span>
          )}
        </div>
      </label>

      <div className="flex items-center justify-end gap-2">{children}</div>
    </div>
  )
}

interface StatusProps {
  transactionId: string
  showRoles?: boolean
}

const TransactionStatus = ({
  transactionId,
  showRoles = false,
}: StatusProps) => (
  <>
    <SimulationStatus transactionId={transactionId} />

    {showRoles && (
      <>
        <Divider />

        <RolePermissionCheck transactionId={transactionId} />
      </>
    )}
  </>
)

type EtherValueProps = { value: bigint }

const EtherValue = ({ value }: EtherValueProps) => {
  const { chainId } = useAccount()

  return (
    <TextInput
      readOnly
      value={formatEther(value || 0)}
      label="Amount"
      description={CHAIN_CURRENCY[chainId]}
    />
  )
}

const routeGoesThroughRoles = (route: ExecutionRoute | null) => {
  if (route == null) {
    return false
  }

  return route.waypoints?.some(
    (waypoint) => waypoint.account.type === AccountType.ROLES,
  )
}
