import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import classNames from 'classnames'
import { ChevronDown } from 'lucide-react'
import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactNode,
} from 'react'
import { BaseButton, type BaseButtonProps } from './BaseButton'

const ButtonGroupContext = createContext({ disabled: false })

export const BaseButtonGroupItem = ({
  className,
  disabled,
  ...props
}: BaseButtonProps) => {
  const defaultDisabled = useDisabled()

  return (
    <MenuItem
      as={BaseButton}
      {...props}
      fluid
      className={classNames('border-transparent', className)}
      disabled={disabled ?? defaultDisabled}
    />
  )
}

const useDisabled = () => {
  const { disabled } = useContext(ButtonGroupContext)

  return disabled
}

export type BaseButtonGroupProps = PropsWithChildren<{
  trigger: ReactNode
  menu: ReactNode
  disabled?: boolean
  className?: string
}>

export const BaseButtonGroup = ({
  className,
  children,
  menu,
  trigger,
  disabled = false,
}: BaseButtonGroupProps) => (
  <ButtonGroupContext value={{ disabled }}>
    <div className={classNames('inline-flex rounded-md', className)}>
      {children}

      <Menu as="div" className="relative -ml-px block">
        {trigger}

        {menu}
      </Menu>
    </div>
  </ButtonGroupContext>
)

export const BaseButtonGroupAction = ({
  disabled,
  ...props
}: BaseButtonProps) => {
  const defaultDisabled = useDisabled()

  return <BaseButton {...props} disabled={disabled ?? defaultDisabled} />
}

export const BaseButtonGroupTrigger = ({
  disabled,
  ...props
}: Omit<BaseButtonProps, 'iconOnly' | 'icon'>) => {
  const defaultDisabled = useDisabled()

  return (
    <MenuButton
      as={BaseButton}
      {...props}
      iconOnly
      icon={ChevronDown}
      disabled={disabled ?? defaultDisabled}
    />
  )
}

export const BaseButtonGroupMenu = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <MenuItems
    transition
    className={classNames(
      'focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md shadow-lg transition',
      className,
    )}
  >
    <div className="flex flex-col py-1">{children}</div>
  </MenuItems>
)
