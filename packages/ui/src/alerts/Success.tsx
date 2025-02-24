import { CheckCheck } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type SuccessProps = PropsWithChildren<{ title?: string }>

export const Success = ({ children, title }: SuccessProps) => (
  <BaseAlert className="border-emerald-600/80">
    {title && (
      <BaseAlert.Title
        className="text-emerald-700 dark:text-emerald-500"
        icon={CheckCheck}
      >
        {title}
      </BaseAlert.Title>
    )}

    {children && <BaseAlert.Description>{children}</BaseAlert.Description>}
  </BaseAlert>
)
