import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useApplicableTranslation } from '@/transaction-translation'
import { GhostButton } from '@zodiac/ui'

type Props = {
  transactionId: string
}

export const Translate = ({ transactionId }: Props) => {
  const provider = useProvider()
  const translation = useApplicableTranslation(transactionId)

  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }

  if (!translation) {
    return null
  }

  return (
    <GhostButton
      iconOnly
      size="small"
      icon={translation.icon}
      onClick={translation.apply}
    >
      {translation.title}
    </GhostButton>
  )
}
