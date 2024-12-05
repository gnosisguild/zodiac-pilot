import { GhostButton } from '@/components'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useApplicableTranslation } from '../../transactionTranslations'

type Props = {
  index: number
}

export const Translate = ({ index }: Props) => {
  const provider = useProvider()
  const translation = useApplicableTranslation(index)

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
