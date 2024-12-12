import { nanoid } from 'nanoid'
import { toast } from 'react-toastify'
import { BaseToast } from './BaseToast'
import type { ToastProps } from './ToastProps'

export const infoToast = ({ title, message }: ToastProps) => {
  const id = nanoid()

  const dismiss = () => toast.dismiss(id)

  toast(
    <BaseToast className="border-zinc-800/80 bg-zinc-900 dark:border-zinc-300/80 dark:bg-zinc-100">
      <div className="flex items-center justify-between gap-4">
        {title && (
          <BaseToast.Title className="text-zinc-50 dark:text-zinc-900">
            {title}
          </BaseToast.Title>
        )}

        <BaseToast.Dismiss
          className="text-zinc-50 hover:bg-white/20 dark:text-zinc-900 dark:hover:bg-zinc-900/10"
          onDismiss={dismiss}
        />
      </div>

      <div className="text-zinc-200 dark:text-zinc-700">{message}</div>
    </BaseToast>,
    { toastId: id },
  )

  return { dismiss }
}
