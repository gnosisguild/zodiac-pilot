import { Hex } from '@zodiac/schema'
import { Spinner, Tag } from '@zodiac/ui'
import { Check } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'

type TransactionStatusProps = PropsWithChildren<{
  hash: Hex
}>

export const TransactionStatus = ({
  hash,
  children,
}: TransactionStatusProps) => {
  const result = useWaitForTransactionReceipt({ hash })

  if (result.isPending) {
    return (
      <Tag color="blue" head={<Spinner />}>
        Pending
      </Tag>
    )
  }

  return (
    <Tag color="green" head={<Check size={16} />}>
      {children || 'Executed'}
    </Tag>
  )
}
