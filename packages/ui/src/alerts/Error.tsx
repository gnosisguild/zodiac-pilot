import { ServerCrash } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type ErrorProps = PropsWithChildren<{
  title?: string
}>

export const Error = ({ children, title }: ErrorProps) => (
  <BaseAlert className="border-red-600/80 dark:border-red-600/80">
    {title && (
      <BaseAlert.Title
        className="text-red-700 dark:text-red-500"
        icon={ServerCrash}
      >
        {title}
      </BaseAlert.Title>
    )}

    {children && <BaseAlert.Description>{children}</BaseAlert.Description>}
  </BaseAlert>
)

Error.Actions = BaseAlert.Actions
