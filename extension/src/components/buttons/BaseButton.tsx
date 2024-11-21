import classNames from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'

export type BaseButtonProps = ComponentPropsWithoutRef<'button'> & {
  fluid?: boolean
  iconOnly?: boolean
}

export const BaseButton = ({
  className,
  fluid = false,
  iconOnly = false,
  ...props
}: BaseButtonProps) => (
  <button
    {...props}
    className={classNames(
      'flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60',
      fluid && 'flex-1',
      iconOnly ? 'p-2' : 'px-4 py-2',
      className
    )}
  />
)

export type BaseLinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  fluid?: boolean
}

export const BaseLinkButton = ({
  fluid = false,
  className,
  ...props
}: BaseLinkButtonProps) => (
  <Link
    {...props}
    className={classNames(
      'flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border text-sm transition-all',
      fluid && 'flex-1',
      className
    )}
  />
)
