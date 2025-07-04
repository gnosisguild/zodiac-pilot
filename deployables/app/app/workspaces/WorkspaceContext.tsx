import { invariant } from '@epic-web/invariant'
import type { Workspace } from '@zodiac/db/schema'
import { createContext, useContext, type PropsWithChildren } from 'react'

const WorkspaceContext = createContext<Workspace | null>(null)

type ProvideWorkspaceProps = PropsWithChildren<{ workspace: Workspace }>

export const ProvideWorkspace = ({
  workspace,
  children,
}: ProvideWorkspaceProps) => (
  <WorkspaceContext value={workspace}>{children}</WorkspaceContext>
)

export const useWorkspace = () => {
  const workspace = useContext(WorkspaceContext)

  invariant(workspace != null, 'No workspace found on context')

  return workspace
}

export const useWorkspaceId = () => {
  const workspace = useWorkspace()

  return workspace.id
}
