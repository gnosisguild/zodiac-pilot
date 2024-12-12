import classNames from 'classnames'
import { X } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { PropsWithChildren, ReactNode } from 'react'
import {
  toast as baseToast,
  Slide,
  type ToastOptions as BaseToastOptions,
} from 'react-toastify'

type ToastRenderProps = {
  dismiss: () => void
}

type ToastRenderFn = (props: ToastRenderProps) => ReactNode

type ToastOptions = Omit<
  BaseToastOptions,
  'toastId' | 'closeButton' | 'hideProgressBar' | 'transition'
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
    transition: Slide,
    className: `mx-4 mt-2 flex max-w-full flex-col gap-1 rounded-md border p-2 text-sm shadow-lg ${className}`,

    ...options,
  })

  return { dismiss }
}

const Title = ({
  children,
  className,
}: PropsWithChildren<{ className: string }>) => (
  <h2 className={classNames('font-semibold', className)}>{children}</h2>
)

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

export const Toast = { Title, Dismiss }
