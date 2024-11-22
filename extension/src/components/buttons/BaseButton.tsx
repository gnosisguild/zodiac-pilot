import classNames from 'classnames'
import { LucideIcon } from 'lucide-react'
import { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'

export type BaseButtonProps = ComponentPropsWithoutRef<'button'> & {
  fluid?: boolean
  iconOnly?: boolean
  icon?: LucideIcon
}

export const BaseButton = ({
  className,
  fluid = false,
  iconOnly = false,
  icon: Icon,
  children,
  title,
  ...props
}: BaseButtonProps) => (
  <button
    {...props}
    title={title ? title : typeof children === 'string' ? children : undefined}
    className={classNames(
      'flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60',
      fluid && 'flex-1',
      iconOnly ? 'p-2' : 'px-4 py-2',
      className
    )}
  >
    {Icon && <Icon size={20} />}

    {iconOnly ? <span className="sr-only">{children}</span> : children}
  </button>
)

export type BaseLinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  fluid?: boolean
  iconOnly?: boolean
  icon?: LucideIcon
}

export const BaseLinkButton = ({
  fluid = false,
  className,
  iconOnly = false,
  icon: Icon,
  children,
  title,
  ...props
}: BaseLinkButtonProps) => (
  <Link
    {...props}
    title={title ? title : typeof children === 'string' ? children : undefined}
    className={classNames(
      'flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm transition-all',
      fluid && 'flex-1',
      iconOnly ? 'p-2' : 'px-4 py-2',
      className
    )}
  >
    {Icon && <Icon size={20} />}

    {iconOnly ? <span className="sr-only">{children}</span> : children}
  </Link>
)
