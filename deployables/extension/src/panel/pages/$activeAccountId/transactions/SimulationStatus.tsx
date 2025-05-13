import { useGetTransactionLink } from '@/providers-ui'
import {
  ExecutionStatus,
  isConfirmedTransaction,
  useTransaction,
  useTransactionStatus,
} from '@/state'
import { GhostLinkButton, Spinner, Tag } from '@zodiac/ui'
import {
  Check,
  Compass,
  SquareArrowOutUpRight,
  TriangleAlert,
} from 'lucide-react'

type Props = {
  transactionId: string
  mini?: boolean
}

export const SimulationStatus = ({ transactionId, mini = false }: Props) => {
  const transaction = useTransaction(transactionId)
  const status = useTransactionStatus(transaction)
  const getTransactionLink = useGetTransactionLink()

  if (mini) {
    return (
      <>
        {status === ExecutionStatus.PENDING && (
          <Tag head={<Spinner />} color="blue"></Tag>
        )}
        {status === ExecutionStatus.SUCCESS && (
          <Tag head={<Compass size={16} />} color="green"></Tag>
        )}
        {status === ExecutionStatus.FAILED ||
          (status === ExecutionStatus.META_TRANSACTION_REVERTED && (
            <Tag head={<Compass size={16} />} color="red"></Tag>
          ))}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-1">
        Simulation
        <div className="flex gap-2">
          {status === ExecutionStatus.PENDING && (
            <Tag head={<Spinner />} color="blue">
              Pending...
            </Tag>
          )}
          {status === ExecutionStatus.SUCCESS && (
            <Tag head={<Check size={16} />} color="green">
              Success
            </Tag>
          )}
          {status === ExecutionStatus.FAILED && (
            <Tag head={<TriangleAlert size={16} />} color="amber">
              Unavailable
            </Tag>
          )}
          {status === ExecutionStatus.META_TRANSACTION_REVERTED && (
            <Tag head={<TriangleAlert size={16} />} color="red">
              Reverted
            </Tag>
          )}

          {isConfirmedTransaction(transaction) && (
            <GhostLinkButton
              openInNewWindow
              iconOnly
              size="small"
              icon={SquareArrowOutUpRight}
              to={getTransactionLink(transaction.transactionHash)}
            >
              View in Tenderly
            </GhostLinkButton>
          )}
        </div>
      </div>
    </div>
  )
}
