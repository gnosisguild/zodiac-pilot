import React, { useState } from 'react'
import { RiCloseLine } from 'react-icons/ri'
import Modal, { Styles } from 'react-modal'
import { Button } from '../Button'
import { Flex } from '../Flex'
import { IconButton } from '../IconButton'
import classes from './style.module.css'

type PropTypes = {
  isOpen: boolean
  onAccept(): void
  onReject(): void
  children: React.ReactNode
}

export const ConfirmationModal: React.FC<PropTypes> = ({
  isOpen,
  onAccept,
  onReject,
  children,
}) => (
  <Modal
    isOpen={isOpen}
    style={modalStyle}
    contentLabel="Sign the batch transaction"
  >
    <IconButton
      className={classes.modalClose}
      title="Cancel"
      onClick={onReject}
    >
      <RiCloseLine />
    </IconButton>
    <Flex direction="column" gap={3} justifyContent="center">
      <p className={classes.message}>
        {children || 'Are you sure you want to continue'}
      </p>
      <Flex gap={4}>
        <Button onClick={onAccept}>Continue</Button>
        <Button onClick={onReject}>Cancel</Button>
      </Flex>
    </Flex>
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
