import { Spinner, Tag } from '@/components'
import { useProvider } from '@/providers'
import { ExecutionStatus, TransactionState } from '@/state'
import { RiExternalLinkLine, RiGitBranchLine } from 'react-icons/ri'
import classes from './style.module.css'

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
    <div className="flex items-center justify-between gap-1">
      <div className="flex items-center gap-2 py-1">
        <div className="w-32">Simulation</div>

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

      {transactionState.transactionHash && (
        <a
          href={provider?.getTransactionLink(transactionState.transactionHash)}
          target="_blank"
          rel="noreferrer"
          className={classes.link}
        >
          View in Tenderly
          <RiExternalLinkLine />
        </a>
      )}
    </div>
  )
}
