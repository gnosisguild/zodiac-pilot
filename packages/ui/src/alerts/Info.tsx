import { InfoIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type InfoProps = PropsWithChildren<{ title?: string }>

export const Info = ({ title, children }: InfoProps) => (
  <BaseAlert className="border-blue-400/80 dark:border-blue-600/80">
    {title && (
      <BaseAlert.Title
        className="text-blue-700 dark:text-blue-500"
        icon={InfoIcon}
      >
        {title}
      </BaseAlert.Title>
    )}
    {children && <BaseAlert.Description>{children}</BaseAlert.Description>}
  </BaseAlert>
)

Info.Actions = BaseAlert.Actions
