import { Spinner, Tag } from '@/components'
import { useProvider } from '@/providers'
import { ExecutionStatus, TransactionState } from '@/state'
import { RiExternalLinkLine, RiGitBranchLine } from 'react-icons/ri'

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
          <Tag head={<RiGitBranchLine />} color="success"></Tag>
        )}
        {transactionState.status === ExecutionStatus.FAILED ||
          (transactionState.status ===
            ExecutionStatus.META_TRANSACTION_REVERTED && (
            <Tag head={<RiGitBranchLine />} color="danger"></Tag>
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
            <Tag head={<RiGitBranchLine />} color="success">
              Success
            </Tag>
          )}
          {transactionState.status === ExecutionStatus.FAILED && (
            <Tag head={<RiGitBranchLine />} color="danger">
              Failed
            </Tag>
          )}
          {transactionState.status ===
            ExecutionStatus.META_TRANSACTION_REVERTED && (
            <Tag head={<RiGitBranchLine />} color="danger">
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
          <RiExternalLinkLine className="size-4" />
        </a>
      )}
    </div>
  )
}
