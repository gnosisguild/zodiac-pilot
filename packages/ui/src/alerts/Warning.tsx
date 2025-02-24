import { MessageSquareWarning } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type WarningProps = PropsWithChildren<{
  title?: string
}>

export const Warning = ({ children, title }: WarningProps) => (
  <BaseAlert className="border-amber-600/80 dark:border-yellow-500/80">
    {title && (
      <BaseAlert.Title
        className="text-amber-700 dark:text-amber-500"
        icon={MessageSquareWarning}
      >
        {title}
      </BaseAlert.Title>
    )}

    {children && <BaseAlert.Description>{children}</BaseAlert.Description>}
  </BaseAlert>
)
