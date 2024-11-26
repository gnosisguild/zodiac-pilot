import { ReactNode, useState } from 'react'
import { GhostButton, SecondaryButton } from '../buttons'
import { Modal } from '../Modal'

type PropTypes = {
  isOpen: boolean
  title: string
  acceptLabel: string
  onAccept(): void
  onReject(): void
  children: ReactNode
}

export const ConfirmationModal = ({
  isOpen,
  title,
  acceptLabel,
  onAccept,
  onReject,
  children,
}: PropTypes) => (
  <Modal open={isOpen} title={title} onClose={onReject} closeLabel="Cancel">
    {children || 'Are you sure you want to continue'}

    <Modal.Actions>
      <GhostButton onClick={onReject}>Cancel</GhostButton>
      <SecondaryButton onClick={onAccept}>{acceptLabel}</SecondaryButton>
    </Modal.Actions>
  </Modal>
)

export const useConfirmationModal = (): [
  (text: string) => Promise<boolean>,
  () => JSX.Element,
] => {
  const [open, setOpen] = useState(false)
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void
  }>()
  const [label, setLabel] = useState('')

  const getConfirmation = async (text: string) => {
    setLabel(text)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolver({ resolve })
    })
  }

  const handleConfirmation = async (status: boolean) => {
    if (!resolver) return
    setOpen(false)
    resolver.resolve(status)
  }

  const Confirmation = () => (
    <ConfirmationModal
      isOpen={open}
      title="Clear existing transactions"
      acceptLabel="Clear transaction"
      onAccept={() => handleConfirmation(true)}
      onReject={() => handleConfirmation(false)}
    >
      {label}
    </ConfirmationModal>
  )

  return [getConfirmation, Confirmation]
}
