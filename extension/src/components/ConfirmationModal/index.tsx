import { X } from 'lucide-react'
import { ReactNode, useState } from 'react'
import Modal, { Styles } from 'react-modal'
import { GhostButton, PrimaryButton } from '../buttons'

type PropTypes = {
  isOpen: boolean
  onAccept(): void
  onReject(): void
  children: ReactNode
}

export const ConfirmationModal = ({
  isOpen,
  onAccept,
  onReject,
  children,
}: PropTypes) => (
  <Modal
    isOpen={isOpen}
    style={modalStyle}
    contentLabel="Sign the batch transaction"
  >
    <div className="absolute right-0 top-0">
      <GhostButton iconOnly icon={X} onClick={onReject}>
        Cancel
      </GhostButton>
    </div>
    <div className="flex flex-col justify-center gap-3">
      <p>{children || 'Are you sure you want to continue'}</p>
      <div className="flex gap-4">
        <GhostButton onClick={onReject}>Cancel</GhostButton>
        <PrimaryButton onClick={onAccept}>Continue</PrimaryButton>
      </div>
    </div>
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
      onAccept={() => handleConfirmation(true)}
      onReject={() => handleConfirmation(false)}
    >
      {label}
    </ConfirmationModal>
  )

  return [getConfirmation, Confirmation]
}

Modal.setAppElement('#root')

const modalStyle: Styles = {
  overlay: {
    backgroundColor: 'rgb(35 34 17 / 82%)',
    zIndex: 2000,
  },

  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    borderColor: '#d9d4ad',
    width: 300,
    borderRadius: 0,
    paddingTop: 30,
    background: 'rgb(84 83 62 / 71%)',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
}
