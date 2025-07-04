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
  TextInput,
} from '@zodiac/ui'
import classNames from 'classnames'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { href, NavLink } from 'react-router'
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
    <NavLink
      key={route.id}
      aria-labelledby={route.id}
      to={href('/workspace/:workspaceId/account/:accountId/route/:routeId?', {
        accountId: route.toId,
        routeId: route.id,
        workspaceId: useWorkspaceId(),
      })}
      role="tab"
      className={({ isActive }) =>
        classNames(
          'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
          isActive
            ? 'border-indigo-500 text-indigo-600 dark:border-teal-300 dark:text-teal-500'
            : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-50',
        )
      }
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
    </NavLink>
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
