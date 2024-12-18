import { type DerivedToastProps, Toast, toast } from './Toast'
import type { ToastProps } from './ToastProps'

const ErrorToast = ({
  data: { title, message },
  closeToast,
}: DerivedToastProps) => (
  <Toast className="border-red-500/60 bg-red-500 dark:border-red-700">
    <div className="flex items-center justify-between gap-4">
      {title && <Toast.Title className="text-white">{title}</Toast.Title>}

      <Toast.Dismiss
        className="text-white hover:bg-white/20"
        onDismiss={closeToast}
      />
    </div>

    <div className="text-red-50">{message}</div>
  </Toast>
)

export const errorToast = ({ title, message }: ToastProps) =>
  toast(ErrorToast, {
    data: { title, message },
    autoClose: false,
  })
