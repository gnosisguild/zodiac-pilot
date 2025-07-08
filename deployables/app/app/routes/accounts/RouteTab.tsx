import { ConfirmableAction } from '@/components'
import { useWorkspaceId } from '@/workspaces'
import type { Route } from '@zodiac/db/schema'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import {
  Checkbox,
  Form,
  GhostButton,
  MeatballMenu,
  Modal,
  Popover,
  PrimaryButton,
  TabBar,
  TextInput,
} from '@zodiac/ui'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { href } from 'react-router'
import { Intent } from './intents'

type RouteTabProps = {
  route: Route
  isDefault: boolean
}

export const RouteTab = ({ route, isDefault }: RouteTabProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)

  return (
    <TabBar.LinkTab
      aria-labelledby={route.id}
      to={href('/workspace/:workspaceId/accounts/:accountId/route/:routeId?', {
        accountId: route.toId,
        routeId: route.id,
        workspaceId: useWorkspaceId(),
      })}
    >
      {isDefault && (
        <Popover popover={<span className="text-sm">Default route</span>}>
          <div className="size-2 rounded-full bg-teal-500 dark:bg-indigo-500" />
        </Popover>
      )}

      <span id={route.id}>{route.label || 'Unnamed route'}</span>

      <MeatballMenu
        label="Route options"
        open={menuOpen || confirmDelete || editing}
        size="tiny"
        onRequestHide={() => setMenuOpen(false)}
        onRequestShow={() => setMenuOpen(true)}
      >
        <Edit route={route} isDefault={isDefault} onUpdateChange={setEditing} />

        <ConfirmableAction
          title="Remove route"
          description="Are you sure you want to remove this route? This action cannot be undone."
          intent={Intent.RemoveRoute}
          busy={useIsPending(Intent.RemoveRoute)}
          onConfirmChange={setConfirmDelete}
          context={{ routeId: route.id }}
          style="critical"
        >
          Remove
        </ConfirmableAction>
      </MeatballMenu>
    </TabBar.LinkTab>
  )
}

type EditProps = {
  route: Route
  isDefault: boolean
  onUpdateChange: (state: boolean) => void
}

const Edit = ({ route, isDefault, onUpdateChange }: EditProps) => {
  const [updating, setUpdating] = useState(false)

  useAfterSubmit(Intent.EditRoute, () => setUpdating(false))

  useEffect(() => {
    onUpdateChange(updating)
  }, [onUpdateChange, updating])

  return (
    <>
      <GhostButton
        size="tiny"
        align="left"
        icon={Pencil}
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()

          setUpdating(true)
        }}
      >
        Edit
      </GhostButton>

      <Modal
        open={updating}
        title="Edit route"
        onClose={() => setUpdating(false)}
      >
        <Form context={{ routeId: route.id }}>
          <TextInput
            label="Label"
            name="label"
            placeholder="Route label"
            defaultValue={route.label ?? ''}
          />

          <Checkbox name="defaultRoute" defaultChecked={isDefault}>
            Use as default route
          </Checkbox>

          <Modal.Actions>
            <PrimaryButton
              submit
              intent={Intent.EditRoute}
              busy={useIsPending(Intent.EditRoute)}
            >
              Update
            </PrimaryButton>
            <Modal.CloseAction>Cancel</Modal.CloseAction>
          </Modal.Actions>
        </Form>
      </Modal>
    </>
  )
}
