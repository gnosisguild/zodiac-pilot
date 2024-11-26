import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { X } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { GhostButton } from './buttons'

type ModalProps = PropsWithChildren<{
  title: string
  closeLabel: string
  description?: string
  open: boolean

  onClose: () => void
}>

export const Modal = ({
  open,
  title,
  description,
  children,
  closeLabel,
  onClose,
}: ModalProps) => {
  return (
    <Dialog
      transition
      open={open}
      onClose={onClose}
      className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur transition-all duration-300 ease-out data-[closed]:backdrop-blur-0"
    >
      <div className="fixed inset-0 flex h-full w-screen flex-col items-center justify-end px-4">
        <DialogPanel
          transition
          className="w-full space-y-4 rounded-t-xl border-x border-t border-zinc-900/80 bg-zinc-100 px-2 pb-4 pt-2 text-sm shadow-lg transition-all data-[closed]:translate-y-full data-[closed]:opacity-0"
        >
          <div className="flex items-center justify-between gap-4 text-zinc-800">
            <DialogTitle className="pl-2 font-bold">{title}</DialogTitle>

            <GhostButton iconOnly icon={X} onClick={onClose}>
              {closeLabel}
            </GhostButton>
          </div>

          <div className="px-2 text-zinc-700">
            {description && <Description>{description}</Description>}

            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

const Actions = ({ children }: PropsWithChildren) => (
  <div className="mt-4 flex justify-end gap-2 border-t border-zinc-300 pt-4">
    {children}
  </div>
)

Modal.Actions = Actions
