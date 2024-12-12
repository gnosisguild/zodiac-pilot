import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { X } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { PropsWithChildren, ReactNode } from 'react'
import {
  toast as baseToast,
  type ToastOptions as BaseToastOptions,
} from 'react-toastify'

type BaseToastProps = PropsWithChildren<{ className: string }>

export const BaseToast = ({ children, className }: BaseToastProps) => (
  <Transition
    appear
    show
    enter="transition-all"
    enterFrom="opacity-0 -translate-y-full"
    leave="transition-all"
    leaveTo="opacity-0 -translate-y-full"
  >
    <div
      className={classNames(
        'mx-2 flex max-w-full flex-col gap-1 rounded-md border p-2 text-sm shadow-lg',
        className,
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

type ToastRenderProps = {
  dismiss: () => void
}

type ToastRenderFn = (props: ToastRenderProps) => ReactNode

type ToastOptions = Omit<
  BaseToastOptions,
  'toastId' | 'closeButton' | 'hideProgressBar'
>

export const toast = (
  renderFn: ToastRenderFn,
  { className, ...options }: ToastOptions = {},
) => {
  const id = nanoid()

  const dismiss = () => baseToast.dismiss(id)

  baseToast(renderFn({ dismiss }), {
    toastId: id,
    closeButton: false,
    hideProgressBar: true,
    className: `mx-4 mt-2 flex max-w-full flex-col gap-1 rounded-md border p-2 text-sm shadow-lg ${className}`,

    ...options,
  })

  return { dismiss }
}
