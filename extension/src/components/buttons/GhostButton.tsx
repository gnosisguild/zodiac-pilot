import classNames from 'classnames'
import { BaseButton, BaseButtonProps } from './BaseButton'
import { WithStyle } from './types'

type GhostButtonProps = WithStyle<Omit<BaseButtonProps, 'className'>>

export const GhostButton = ({
  style = 'regular',
  ...props
}: GhostButtonProps) => (
  <BaseButton
    {...props}
    className={classNames(
      'border-transparent bg-transparent font-bold',
      style === 'regular' && 'enabled:hover:bg-zinc-100',
      style === 'critical' &&
        'text-red-500 enabled:hover:bg-red-900 enabled:hover:text-red-400'
    )}
  />
)
