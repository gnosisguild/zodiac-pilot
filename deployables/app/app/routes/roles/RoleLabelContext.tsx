import { decodeRoleKey } from '@zodiac/modules'
import { createContext, PropsWithChildren, useContext } from 'react'

export type RoleLabels = Record<string, string>
const RoleLabelContext = createContext<RoleLabels>({})

export const ProvideRoleLabels = ({
  labels,
  children,
}: PropsWithChildren<{ labels: RoleLabels }>) => (
  <RoleLabelContext value={labels}>{children}</RoleLabelContext>
)

export const LabeledRoleKey = ({ children }: { children: string }) => {
  const labels = useContext(RoleLabelContext)
  const label = labels[children]

  const key = decodeRoleKey(children)

  if (label == null) {
    return <span className="font-mono">{key}</span>
  }

  return (
    <div className="flex max-w-full items-center gap-2 overflow-hidden">
      <div className="whitespace-nowrap font-semibold">{label}</div>
      <code
        aria-hidden
        className="inline-flex max-w-full flex-1 overflow-hidden text-ellipsis text-nowrap font-mono text-xs opacity-50"
      >
        {key}
      </code>
    </div>
  )
}
