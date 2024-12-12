import { Toast, toast } from './Toast'
import type { ToastProps } from './ToastProps'

export const successToast = ({ title, message }: ToastProps) =>
  toast(
    ({ dismiss }) => (
      <>
        <div className="flex items-center justify-between gap-4">
          {title && (
            <Toast.Title className="text-green-900 dark:text-white">
              {title}
            </Toast.Title>
          )}

          <Toast.Dismiss
            className="text-green-900 hover:bg-green-500/20 dark:text-white dark:hover:bg-white/10"
            onDismiss={dismiss}
          />
        </div>

        <div className="text-green-700 dark:text-green-50">{message}</div>
      </>
    ),
    {
      className:
        'border-green-300/80 bg-green-200 dark:border-green-500/80 dark:bg-green-600',
    },
  )
