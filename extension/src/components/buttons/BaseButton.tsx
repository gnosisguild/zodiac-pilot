import classNames from 'classnames'
import type { LucideIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'

type SharedButtonProps = {
  fluid?: boolean
  iconOnly?: boolean
  icon?: LucideIcon
  size?: 'small' | 'base'
}

export type BaseButtonProps = ComponentPropsWithoutRef<'button'> &
  SharedButtonProps

export const BaseButton = ({
  className,
  fluid = false,
  iconOnly = false,
  icon: Icon,
  size = 'base',
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
      getPadding({ iconOnly, size }),
      className
    )}
  >
    {Icon && <Icon size={size === 'base' ? 20 : 16} />}

    {iconOnly ? <span className="sr-only">{children}</span> : children}
  </button>
)

export type BaseLinkButtonProps = ComponentPropsWithoutRef<typeof Link> &
  SharedButtonProps & {
    openInNewWindow?: boolean
  }

export const BaseLinkButton = ({
  fluid = false,
  className,
  iconOnly = false,
  icon: Icon,
  openInNewWindow = false,
  size = 'base',
  children,
  title,
  ...props
}: BaseLinkButtonProps) => (
  <Link
    {...props}
    title={title ? title : typeof children === 'string' ? children : undefined}
    target={openInNewWindow ? '_blank' : props.target}
    rel={openInNewWindow ? 'noreferrer noopener' : props.rel}
    className={classNames(
      'flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm transition-all',
      fluid && 'flex-1',
      getPadding({ iconOnly, size }),
      className
    )}
  >
    {Icon && <Icon size={size === 'base' ? 20 : 16} />}

    {iconOnly ? <span className="sr-only">{children}</span> : children}
  </Link>
)

const getPadding = ({
  iconOnly = false,
  size = 'base',
}: Pick<SharedButtonProps, 'iconOnly' | 'size'>) => {
  switch (size) {
    case 'base': {
      return iconOnly ? 'p-2' : 'px-4 py-2'
    }
    case 'small': {
      return iconOnly ? 'p-1' : 'px-2 py-1'
    }
  }
}
