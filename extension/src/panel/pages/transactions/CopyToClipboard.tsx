import { GhostButton, infoToast } from '@/components'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { Copy } from 'lucide-react'

interface Props {
  transaction: MetaTransactionData
  labeled?: boolean
}

export const CopyToClipboard = ({ transaction, labeled }: Props) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction, undefined, 2))
    infoToast({
      title: 'Copied!',
      message: 'Transaction data has been copied to clipboard.',
    })
  }

  if (labeled) {
    return (
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1 text-xs opacity-75"
      >
        Copy data
        <Copy size={16} />
      </button>
    )
  }

  return (
    <GhostButton iconOnly size="small" icon={Copy} onClick={copyToClipboard}>
      Copy transaction data to clipboard
    </GhostButton>
  )
}
