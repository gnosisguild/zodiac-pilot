import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { X } from 'lucide-react'
import { PropsWithChildren } from 'react'

type BaseToastProps = PropsWithChildren<{ className: string; visible: boolean }>

export const BaseToast = ({ children, className, visible }: BaseToastProps) => (
  <Transition
    appear
    show={visible}
    enter="transition-all"
    enterFrom="opacity-0 -translate-y-full"
    leave="transition-all"
    leaveTo="opacity-0 -translate-y-full"
  >
    <div
      className={classNames(
        'flex flex-col gap-1 rounded-md border p-2 text-sm shadow-lg',
        className
      )}
    >
      {children}
    </div>
  </Transition>
)

const Title = ({
  children,
  className,
}: PropsWithChildren<{ className: string }>) => (
  <h2 className={classNames('font-semibold', className)}>{children}</h2>
)

BaseToast.Title = Title

const Dismiss = ({
  children,
  className,
  onDismiss,
}: PropsWithChildren<{ className: string; onDismiss: () => void }>) => (
  <button
    onClick={onDismiss}
    className={classNames('rounded-md p-1 transition-all', className)}
  >
    <X size={16} />

    <span className="sr-only">{children}</span>
    {children}
  </button>
)

BaseToast.Dismiss = Dismiss
