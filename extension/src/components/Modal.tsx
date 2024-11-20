import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { PropsWithChildren } from 'react'

type ModalProps = PropsWithChildren<{
  title: string
  description?: string
  open: boolean

  onClose: () => void
}>

export const Modal = ({
  open,
  title,
  description,
  children,
  onClose,
}: ModalProps) => {
  return (
    <Dialog
      transition
      open={open}
      onClose={onClose}
      className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 rounded-md border border-zinc-400/20 bg-zinc-900 p-4 shadow-lg">
          <DialogTitle className="font-bold">{title}</DialogTitle>

          {description && <Description>{description}</Description>}

          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

const Actions = ({ children }: PropsWithChildren) => (
  <div className="flex gap-4">{children}</div>
)

Modal.Actions = Actions
