import { useAfterSubmit } from '@zodiac/hooks'
import {
  Form,
  GhostButton,
  Modal,
  PrimaryButton,
  type BaseButtonProps,
  type ButtonStyle,
} from '@zodiac/ui'
import { Trash2 } from 'lucide-react'
import {
  useEffect,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from 'react'

type ConfirmableActionProps = PropsWithChildren<{
  intent: string
  title: string
  description: string
  context?: ComponentProps<typeof Form>['context']
  style?: ButtonStyle
  busy?: BaseButtonProps['busy']
  onConfirmChange: (state: boolean) => void
}>

export const ConfirmableAction = ({
  intent,
  context,
  style,
  children,
  title,
  description,
  busy,
  onConfirmChange,
}: ConfirmableActionProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false)

  useAfterSubmit(intent, () => setConfirmDelete(false))

  useEffect(() => {
    onConfirmChange(confirmDelete)
  }, [confirmDelete, onConfirmChange])

  return (
    <>
      <GhostButton
        align="left"
        size="tiny"
        icon={Trash2}
        style={style}
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()

          setConfirmDelete(true)
        }}
        busy={busy}
      >
        {children}
      </GhostButton>

      <Modal
        title={title}
        onClose={() => setConfirmDelete(false)}
        open={confirmDelete}
        description={description}
      >
        <Form context={context}>
          <Modal.Actions>
            <PrimaryButton submit intent={intent} busy={busy} style={style}>
              {children}
            </PrimaryButton>

            <Modal.CloseAction>Cancel</Modal.CloseAction>
          </Modal.Actions>
        </Form>
      </Modal>
    </>
  )
}
