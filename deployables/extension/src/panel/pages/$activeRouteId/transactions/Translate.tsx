import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useApplicableTranslation } from '@/transaction-translation'
import { GhostButton, SecondaryButton } from '@zodiac/ui'

type Props = {
  transactionId: string
  mini?: boolean
}

export const Translate = ({ transactionId, mini }: Props) => {
  const provider = useProvider()
  const translation = useApplicableTranslation(transactionId)

  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }

  if (!translation) {
    return null
  }

  return mini ? (
    <GhostButton
      fluid={mini}
      iconOnly
      size="small"
      icon={translation.icon}
      onClick={translation.apply}
    >
      {translation.title}
    </GhostButton>
  ) : (
    <SecondaryButton
      fluid
      size="small"
      icon={translation.icon}
      onClick={translation.apply}
    >
      {translation.title}
    </SecondaryButton>
  )
}
