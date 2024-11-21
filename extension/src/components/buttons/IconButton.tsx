import cn from 'classnames'
import { BaseButton, BaseButtonProps } from './BaseButton'

type Props = Omit<BaseButtonProps, 'className'> & {
  danger?: boolean
}

export const IconButton = ({ danger, ...rest }: Props) => (
  <BaseButton
    className={cn(
      'size-9 border-transparent bg-transparent p-1',
      danger ? 'text-red-500' : 'text-white'
    )}
    {...rest}
  />
)
