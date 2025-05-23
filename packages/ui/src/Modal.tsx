import { createContext, useContext, type PropsWithChildren } from 'react'
import { GhostButton } from './buttons'
import {
  Alert,
  AlertActions,
  AlertBody,
  AlertDescription,
  AlertTitle,
} from './catalyst'

type Context = {
  onClose: () => void
}

const ModalContext = createContext<Context>({
  onClose() {
    throw new Error('onClose not found on context')
  },
})

const useOnClose = () => {
  const { onClose } = useContext(ModalContext)

  return onClose
}

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
      <ModalContext value={{ onClose }}>
        {title && <AlertTitle>{title}</AlertTitle>}

        {description && <AlertDescription>{description}</AlertDescription>}

        <AlertBody>{children}</AlertBody>
      </ModalContext>
    </Alert>
  )
}

const Actions = ({ children }: PropsWithChildren) => (
  <AlertActions>{children}</AlertActions>
)

Modal.Actions = Actions

const CloseAction = ({ children }: PropsWithChildren) => (
  <GhostButton onClick={useOnClose()}>{children}</GhostButton>
)

Modal.CloseAction = CloseAction
