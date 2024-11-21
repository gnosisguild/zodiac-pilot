import classNames from 'classnames'
import {
  BaseButton,
  BaseButtonProps,
  BaseLinkButton,
  BaseLinkButtonProps,
} from './BaseButton'
import { WithStyle } from './types'

type BoxButtonProps = WithStyle<Omit<BaseButtonProps, 'className'>>

export const BoxButton = ({ style = 'regular', ...props }: BoxButtonProps) => (
  <BaseButton
    {...props}
    className={classNames(
      'font-bold',
      style === 'regular' &&
        'border-zinc-600 bg-zinc-950 text-zinc-50 enabled:hover:border-zinc-600 enabled:hover:bg-zinc-800'
    )}
  />
)

type BoxLinkProps = WithStyle<Omit<BaseLinkButtonProps, 'className'>>

export const BoxLink = ({ style = 'regular', ...props }: BoxLinkProps) => (
  <BaseLinkButton
    {...props}
    className={classNames(
      'font-bold',
      style === 'regular' &&
        'border-zinc-600 bg-zinc-950 text-zinc-50 hover:border-zinc-600 hover:bg-zinc-800'
    )}
  />
)
