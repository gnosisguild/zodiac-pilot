import { GhostButton } from '@/components'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { Wrench } from 'lucide-react'
import { useApplicableTranslation } from '../../transactionTranslations'

type Props = {
  index: number
  labeled?: true
}

export const Translate = ({ index, labeled }: Props) => {
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
      iconOnly={!labeled}
      size="small"
      icon={Wrench}
      onClick={translation.apply}
    >
      {translation.title}
    </GhostButton>
  )
}
