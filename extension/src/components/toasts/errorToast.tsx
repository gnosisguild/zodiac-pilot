import { nanoid } from 'nanoid'
import { toast } from 'react-toastify'
import { BaseToast } from './BaseToast'
import type { ToastProps } from './ToastProps'

export const errorToast = ({ title, message }: ToastProps) => {
  const id = nanoid()

  const dismiss = () => toast.dismiss(id)

  toast(
    <BaseToast className="border-red-500/60 bg-red-500 dark:border-red-700">
      <div className="flex items-center justify-between gap-4">
        {title && (
          <BaseToast.Title className="text-white">{title}</BaseToast.Title>
        )}

        <BaseToast.Dismiss
          className="text-white hover:bg-white/20"
          onDismiss={dismiss}
        />
      </div>

      <div className="text-red-50">{message}</div>
    </BaseToast>,
    { toastId: id },
  )

  return { dismiss }
}
