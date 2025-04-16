import { useAccount } from '@/companion'
import { useExecutionRoute } from '@/execution-routes'
import type { TransactionState } from '@/state'
import type { ExecutionRoute } from '@/types'
import { CHAIN_CURRENCY, getChainId } from '@zodiac/chains'
import { CopyToClipboard, Divider, TextInput, ToggleButton } from '@zodiac/ui'
import { formatEther, Fragment } from 'ethers'
import { useState } from 'react'
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
  transactionState: TransactionState
}

export const Transaction = ({ transactionState }: Props) => {
  const [expanded, setExpanded] = useState(true)
  const route = useExecutionRoute()
  const chainId = getChainId(route.avatar)
  const decoded = useDecodedFunctionData(transactionState)
  const showRoles = routeGoesThroughRoles(route)

  return (
    <section
      aria-labelledby={transactionState.id}
      className="flex flex-col rounded-md border border-zinc-300/80 dark:border-zinc-500/60"
    >
      <div className="bg-zinc-100/80 p-2 dark:bg-zinc-500/20">
        <TransactionHeader
          transactionState={transactionState}
          functionFragment={decoded?.functionFragment}
          expanded={expanded}
          onExpandToggle={() => setExpanded(!expanded)}
          showRoles={showRoles}
        />
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-zinc-300 bg-zinc-200/80 px-2 py-4 text-sm dark:border-zinc-500/80 dark:bg-zinc-500/30">
          <ContractAddress
            chainId={chainId}
            address={transactionState.transaction.to}
            contractInfo={transactionState.contractInfo}
          />

          <EtherValue value={transactionState.transaction.value} />

          {decoded ? (
            <DecodedTransaction {...decoded}>
              <Divider />
            </DecodedTransaction>
          ) : (
            <>
              <Divider />

              <RawTransaction data={transactionState.transaction.data} />
            </>
          )}

          <Divider />

          <TransactionStatus
            transactionState={transactionState}
            showRoles={showRoles}
          />
        </div>
      )}
    </section>
  )
}

interface HeaderProps {
  transactionState: TransactionState
  functionFragment?: Fragment
  onExpandToggle(): void
  expanded: boolean
  showRoles?: boolean
}

const TransactionHeader = ({
  transactionState,
  functionFragment,
  onExpandToggle,
  expanded,
  showRoles = false,
}: HeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="flex cursor-pointer items-center gap-2 overflow-hidden">
        <ToggleButton expanded={expanded} onToggle={onExpandToggle} />

        <div className="flex flex-col gap-1 overflow-hidden">
          <h5
            id={transactionState.id}
            className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold"
          >
            {functionFragment
              ? functionFragment.format('sighash').split('(')[0]
              : 'Raw transaction'}
          </h5>

          {transactionState.transaction.operation === 1 && (
            <span className="text-xs font-normal uppercase opacity-75">
              delegatecall
            </span>
          )}
        </div>
      </label>

      <div className="flex items-center justify-end gap-2">
        <SimulationStatus transactionState={transactionState} mini />

        {showRoles && (
          <RolePermissionCheck transactionState={transactionState} mini />
        )}

        <div className="flex">
          <Translate mini transactionId={transactionState.id} />
          <CopyToClipboard
            iconOnly
            size="small"
            data={transactionState.transaction}
          >
            Copy transaction data to clipboard
          </CopyToClipboard>
          <Remove transactionState={transactionState} />
        </div>
      </div>
    </div>
  )
}

interface StatusProps {
  transactionState: TransactionState
  showRoles?: boolean
}

const TransactionStatus = ({
  transactionState,
  showRoles = false,
}: StatusProps) => (
  <>
    <SimulationStatus transactionState={transactionState} />

    {showRoles && (
      <>
        <Divider />

        <RolePermissionCheck transactionState={transactionState} />
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

const routeGoesThroughRoles = (route: ExecutionRoute) =>
  route.waypoints?.some(
    (waypoint) => waypoint.account.type === AccountType.ROLES,
  )
