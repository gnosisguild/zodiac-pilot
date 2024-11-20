import { Spinner, Tag } from '@/components'
import { useProvider } from '@/providers'
import { ExecutionStatus, TransactionState } from '@/state'
import {
  Check,
  Compass,
  SquareArrowOutUpRight,
  TriangleAlert,
} from 'lucide-react'

type Props = {
  transactionState: TransactionState
  mini?: boolean
}

export const SimulationStatus = ({ transactionState, mini = false }: Props) => {
  const provider = useProvider()

  if (mini) {
    return (
      <>
        {transactionState.status === ExecutionStatus.PENDING && (
          <Tag head={<Spinner />} color="info"></Tag>
        )}
        {transactionState.status === ExecutionStatus.SUCCESS && (
          <Tag head={<Compass size={16} />} color="success"></Tag>
        )}
        {transactionState.status === ExecutionStatus.FAILED ||
          (transactionState.status ===
            ExecutionStatus.META_TRANSACTION_REVERTED && (
            <Tag head={<Compass size={16} />} color="danger"></Tag>
          ))}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-1">
        Simulation
        <div className="flex flex-col gap-2">
          {transactionState.status === ExecutionStatus.PENDING && (
            <Tag head={<Spinner />} color="info">
              Pending...
            </Tag>
          )}
          {transactionState.status === ExecutionStatus.SUCCESS && (
            <Tag head={<Check size={16} />} color="success">
              Success
            </Tag>
          )}
          {transactionState.status === ExecutionStatus.FAILED && (
            <Tag head={<TriangleAlert size={16} />} color="danger">
              Failed
            </Tag>
          )}
          {transactionState.status ===
            ExecutionStatus.META_TRANSACTION_REVERTED && (
            <Tag head={<TriangleAlert size={16} />} color="danger">
              Reverted
            </Tag>
          )}
        </div>
      </div>

      {transactionState.transactionHash && (
        <a
          href={provider?.getTransactionLink(transactionState.transactionHash)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs no-underline opacity-75"
        >
          View in Tenderly
          <SquareArrowOutUpRight size={14} />
        </a>
      )}
    </div>
  )
}
