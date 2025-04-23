import type { PropsWithChildren } from 'react'
import {
  Alert,
  AlertActions,
  AlertBody,
  AlertDescription,
  AlertTitle,
} from './catalyst'

type ModalProps = PropsWithChildren<{
  title?: string
  description?: string
  open: boolean

  onClose?: () => void
}>

export const Modal = ({
  open,
  title,
  description,
  children,
  onClose = () => null,
}: ModalProps) => {
  return (
    <Alert open={open} onClose={onClose}>
      {title && <AlertTitle>{title}</AlertTitle>}

      {description && <AlertDescription>{description}</AlertDescription>}

      <AlertBody>{children}</AlertBody>
    </Alert>
  )
}

const Actions = ({ children }: PropsWithChildren) => (
  <AlertActions>{children}</AlertActions>
)

Modal.Actions = Actions
