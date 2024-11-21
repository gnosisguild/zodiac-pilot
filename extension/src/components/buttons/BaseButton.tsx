import classNames from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  fluid?: boolean
}

export const BaseButton = ({
  className,
  fluid = false,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={classNames(
      'flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60',
      fluid && 'flex-1',
      className
    )}
  />
)

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  fluid?: boolean
}

export const BaseLinkButton = ({
  fluid = false,
  className,
  ...props
}: LinkButtonProps) => (
  <Link
    {...props}
    className={classNames(
      'flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border text-sm transition-all',
      fluid && 'flex-1',
      className
    )}
  />
)
