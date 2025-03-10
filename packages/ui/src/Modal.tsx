import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { X } from 'lucide-react'
import type { PropsWithChildren } from 'react'
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
      className="backdrop-blur-xs data-closed:backdrop-blur-0 absolute inset-0 z-50 bg-zinc-200/20 transition-all duration-300 ease-out md:duration-700 dark:bg-slate-900/20"
    >
      <div className="fixed inset-0 flex h-full w-screen flex-col items-center justify-end px-4 md:justify-center">
        <DialogPanel
          transition
          className="data-closed:translate-y-full md:data-closed:translate-y-0 md:data-closed:scale-125 data-closed:opacity-0 w-full space-y-4 rounded-t-xl border-x border-t border-zinc-200/80 bg-zinc-900 px-2 pb-4 pt-2 text-sm shadow-lg transition-all md:w-1/3 md:rounded-b-xl dark:border-zinc-900/80 dark:bg-zinc-100"
        >
          <div className="flex items-center justify-between gap-4 text-zinc-50 dark:text-zinc-800">
            <DialogTitle className="pl-2 font-bold">{title}</DialogTitle>

            <GhostButton style="contrast" iconOnly icon={X} onClick={onClose}>
              {closeLabel}
            </GhostButton>
          </div>

          <div className="flex flex-col px-2 text-zinc-200 dark:text-zinc-700">
            {description && <Description>{description}</Description>}

            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

const Actions = ({ children }: PropsWithChildren) => (
  <div className="mt-2 flex flex-row-reverse justify-start gap-2 border-t border-zinc-700 pt-2 md:mt-4 md:pt-4 dark:border-zinc-300">
    {children}
  </div>
)

Modal.Actions = Actions
