import classNames from 'classnames'
import type { LucideIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router'

type SharedButtonProps = {
  fluid?: boolean
  iconOnly?: boolean
  icon?: LucideIcon
  size?: 'tiny' | 'small' | 'base'
  submit?: boolean
  intent?: string
}

export type BaseButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'type'> &
  SharedButtonProps

export const BaseButton = ({
  className,
  fluid = false,
  iconOnly = false,
  icon: Icon,
  size = 'base',
  children,
  title,
  submit = false,
  intent,
  ...props
}: BaseButtonProps) => (
  <button
    {...props}
    type={submit ? 'submit' : 'button'}
    title={title ? title : typeof children === 'string' ? children : undefined}
    name={intent != null ? 'intent' : props.name}
    value={intent != null ? intent : props.value}
    className={classNames(
      'outline-hidden flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border transition-all disabled:cursor-not-allowed disabled:opacity-60',
      fluid && 'flex-1',
      getPadding({ iconOnly, size }),
      className,
    )}
  >
    {Icon && <Icon size={size === 'base' ? 20 : 16} />}

    {iconOnly ? <span className="sr-only">{children}</span> : children}
  </button>
)

type EnabledLinkProps = ComponentPropsWithoutRef<typeof Link> &
  SharedButtonProps & {
    openInNewWindow?: boolean
    disabled?: false
  }

type DisabledLinkProps = BaseButtonProps & {
  to: string
  openInNewWindow?: boolean
  disabled: true
}

export type BaseLinkButtonProps = EnabledLinkProps | DisabledLinkProps

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
}: BaseLinkButtonProps) => {
  if ('disabled' in props && props.disabled) {
    return (
      <BaseButton
        fluid={fluid}
        className={className}
        icon={Icon}
        iconOnly={iconOnly}
        size={size}
        title={title}
        {...props}
      >
        {children}
      </BaseButton>
    )
  }

  return (
    <Link
      {...props}
      title={
        title ? title : typeof children === 'string' ? children : undefined
      }
      target={openInNewWindow ? '_blank' : props.target}
      rel={openInNewWindow ? 'noreferrer noopener' : props.rel}
      className={classNames(
        'flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border transition-all',
        fluid && 'flex-1',
        getPadding({ iconOnly, size }),
        className,
      )}
    >
      {Icon && <Icon size={size === 'base' ? 20 : 16} />}

      {iconOnly ? <span className="sr-only">{children}</span> : children}
    </Link>
  )
}

const getPadding = ({
  iconOnly = false,
  size = 'base',
}: Pick<SharedButtonProps, 'iconOnly' | 'size'>) => {
  switch (size) {
    case 'base': {
      return classNames('text-sm', iconOnly ? 'p-2' : 'px-4 py-2')
    }
    case 'small': {
      return classNames('text-sm', iconOnly ? 'p-1' : 'px-2 py-1')
    }
    case 'tiny': {
      return classNames(iconOnly ? 'p-1' : 'px-2 py-1 text-xs')
    }
  }
}
