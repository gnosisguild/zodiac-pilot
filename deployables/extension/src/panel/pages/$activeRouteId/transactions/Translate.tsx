import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useApplicableTranslation } from '@/transaction-translation'
import { GhostButton } from '@zodiac/ui'

type Props = {
  transactionId: string
  iconOnly?: boolean
  fluid?: boolean
}

export const Translate = ({ transactionId, iconOnly, fluid }: Props) => {
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
      fluid={fluid}
      iconOnly={iconOnly}
      size={iconOnly ? 'small' : 'base'}
      icon={translation.icon}
      onClick={translation.apply}
    >
      {translation.title}
    </GhostButton>
  )
}
