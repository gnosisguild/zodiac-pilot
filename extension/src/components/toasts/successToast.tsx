import toast from 'react-hot-toast'
import { BaseToast } from './BaseToast'
import { ToastProps } from './ToastProps'

export const successToast = ({ title, message }: ToastProps) =>
  toast.custom((t) => (
    <BaseToast
      visible={t.visible}
      className="border-green-300/80 bg-green-200 dark:border-green-500/80 dark:bg-green-600"
    >
      <div className="flex items-center justify-between gap-4">
        {title && (
          <BaseToast.Title className="text-green-900 dark:text-white">
            {title}
          </BaseToast.Title>
        )}

        <BaseToast.Dismiss
          className="text-green-900 hover:bg-green-500/20 dark:text-white dark:hover:bg-white/10"
          onDismiss={() => toast.dismiss(t.id)}
        />
      </div>

      <div className="text-green-700 dark:text-green-50">{message}</div>
    </BaseToast>
  ))
