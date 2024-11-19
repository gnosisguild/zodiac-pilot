import { IconButton } from '@/components'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { RiFileCopy2Line } from 'react-icons/ri'
import { toast } from 'react-toastify'

interface Props {
  transaction: MetaTransactionData
  labeled?: boolean
}

export const CopyToClipboard = ({ transaction, labeled }: Props) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction, undefined, 2))
    toast(<>Transaction data has been copied to clipboard.</>)
  }

  if (labeled) {
    return (
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1 text-xs opacity-75"
      >
        Copy data
        <RiFileCopy2Line className="size-4" />
      </button>
    )
  } else {
    return (
      <IconButton
        onClick={copyToClipboard}
        title="Copy transaction data to clipboard"
      >
        <RiFileCopy2Line />
      </IconButton>
    )
  }
}
