import { useProvider } from '@/providers-ui'
import { ExecutionStatus, type TransactionState } from '@/state'
import { GhostLinkButton, Spinner, Tag } from '@zodiac/ui'
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
        <div className="flex gap-2">
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

          {transactionState.transactionHash && (
            <GhostLinkButton
              openInNewWindow
              iconOnly
              size="small"
              icon={SquareArrowOutUpRight}
              to={provider?.getTransactionLink(
                transactionState.transactionHash,
              )}
            >
              View in Tenderly
            </GhostLinkButton>
          )}
        </div>
      </div>
    </div>
  )
}
