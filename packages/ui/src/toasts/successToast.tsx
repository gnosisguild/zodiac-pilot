import { Toast, toast, type DerivedToastProps } from './Toast'
import type { ToastProps } from './ToastProps'

const SuccessToast = ({
  data: { title, message },
  closeToast,
}: DerivedToastProps) => (
  <Toast className="border-green-300/80 bg-green-200 dark:border-green-500/80 dark:bg-green-800">
    <Toast.Header>
      <Toast.Title className="text-green-900 dark:text-white">
        {title}
      </Toast.Title>

      <Toast.Dismiss
        className="text-green-900 hover:bg-green-500/20 dark:text-white dark:hover:bg-white/10"
        onDismiss={closeToast}
      />
    </Toast.Header>

    <Toast.Message className="text-green-700 dark:text-green-50">
      {message}
    </Toast.Message>
  </Toast>
)

export const successToast = ({ title, message }: ToastProps) =>
  toast(SuccessToast, { data: { message, title } })
