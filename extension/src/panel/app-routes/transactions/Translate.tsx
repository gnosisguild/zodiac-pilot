import { IconButton } from '@/components'
import { ForkProvider } from '@/providers'
import { BiWrench } from 'react-icons/bi'
import { useApplicableTranslation } from '../../transactionTranslations'
import { useProvider } from '@/providers-ui'
import classes from './style.module.css'

type Props = {
  index: number
  labeled?: true
}

export const Translate = ({  index, labeled }: Props) => {
  const provider = useProvider()
  const translation = useApplicableTranslation(index)

  if (!(provider instanceof ForkProvider)) {
    // Transaction translation is only supported when using ForkProvider
    return null
  }

  if (!translation) {
    return null
  }

  if (labeled) {
    return (
      <button onClick={translation.apply} className={classes.link}>
        {translation.title}
        <BiWrench />
      </button>
    )
  } else {
    return (
      <IconButton onClick={translation.apply} title={translation.title}>
        <BiWrench />
      </IconButton>
    )
  }
}
