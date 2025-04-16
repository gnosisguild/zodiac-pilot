import classNames from 'classnames'
import { type LucideIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router'
import { Spinner } from '../Spinner'
import { defaultSize, type Size } from '../common'

type SharedButtonProps = {
  /**
   * Fluid makes the button take up as much horizontal space as possible
   */
  fluid?: boolean
  iconOnly?: boolean
  icon?: LucideIcon
  size?: Size
  /**
   * Turns the button into a type="submit" button that can be used inside forms
   */
  submit?: boolean
  /**
   * Shortcut to set the name of the button to "intent" and the value to the
   * specified intent.
   */
  intent?: string
  /**
   * You can use this to indicate that an action is happening. For instance,
   * when a form is being submitted. When a button is busy it will show
   * an indicator and also be disabled.
   */
  busy?: boolean

  /**
   * @default center
   */
  align?: 'left' | 'center' | 'right'
}

export type BaseButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'type'> &
  SharedButtonProps

export const BaseButton = ({
  className,
  fluid = false,
  iconOnly = false,
  icon: Icon,
  size = defaultSize,
  children,
  title,
  submit = false,
  intent,
  busy = false,
  disabled = busy,
  align = 'center',
  ...props
}: BaseButtonProps) => (
  <button
    {...props}
    type={submit ? 'submit' : 'button'}
    disabled={disabled}
    title={title ? title : typeof children === 'string' ? children : undefined}
    name={intent != null ? 'intent' : props.name}
    value={intent != null ? intent : props.value}
    className={classNames(
      'outline-hidden relative cursor-pointer rounded-md border transition-all disabled:cursor-not-allowed disabled:opacity-75',
      fluid && 'flex-1',
      getPadding({ iconOnly, size }),
      className,
      iconOnly && 'shrink-0',
    )}
  >
    <span
      className={classNames(
        'pointer-events-none flex items-center gap-2 whitespace-nowrap',
        busy && 'invisible',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
      )}
    >
      {Icon && (
        <Icon size={size === 'base' ? 20 : 16} className="flex-shrink-0" />
      )}

      {iconOnly ? <span className="sr-only">{children}</span> : children}
    </span>

    {busy && (
      <span className="absolute inset-0 flex items-center justify-center">
        <Spinner />
      </span>
    )}
  </button>
)

export type BaseLinkButtonProps = ComponentPropsWithoutRef<typeof Link> &
  SharedButtonProps & {
    openInNewWindow?: boolean
    disabled?: boolean
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
  align = 'center',
  busy,
  ...props
}: BaseLinkButtonProps) => {
  if ('disabled' in props && props.disabled) {
    return (
      <BaseButton
        disabled
        fluid={fluid}
        className={className}
        icon={Icon}
        iconOnly={iconOnly}
        size={size}
        title={title}
        align={align}
        busy={busy}
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
        'relative flex cursor-pointer rounded-md border outline-none transition-all',
        fluid && 'flex-1',
        getPadding({ iconOnly, size }),
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        iconOnly && 'shrink-0',
        className,
      )}
    >
      <span
        className={classNames(
          'flex items-center gap-2 whitespace-nowrap',
          busy && 'invisible',
          align === 'left' && 'justify-start',
          align === 'center' && 'justify-center',
          align === 'right' && 'justify-end',
        )}
      >
        {Icon && (
          <Icon size={size === 'base' ? 20 : 16} className="flex-shrink-0" />
        )}

        {iconOnly ? <span className="sr-only">{children}</span> : children}
      </span>

      {busy && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </Link>
  )
}

export const getPadding = ({
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
