import { Toast, toast, type DerivedToastProps } from './Toast'
import type { ToastProps } from './ToastProps'

const InfoToast = ({
  data: { title, message },
  closeToast,
}: DerivedToastProps) => (
  <Toast className="border-zinc-800/80 bg-zinc-900 dark:border-zinc-300/80 dark:bg-zinc-100">
    <Toast.Header>
      <Toast.Title className="text-zinc-50 dark:text-zinc-900">
        {title}
      </Toast.Title>

      <Toast.Dismiss
        className="text-zinc-50 hover:bg-white/20 dark:text-zinc-900 dark:hover:bg-zinc-900/10"
        onDismiss={closeToast}
      />
    </Toast.Header>

    <Toast.Message className="text-zinc-200 dark:text-zinc-700">
      {message}
    </Toast.Message>
  </Toast>
)

export const infoToast = ({ title, message }: ToastProps) =>
  toast(InfoToast, { data: { title, message } })
