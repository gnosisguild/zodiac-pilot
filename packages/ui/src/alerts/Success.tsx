import type { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type SuccessProps = PropsWithChildren<{ title?: string }>

export const Success = ({ children, title }: SuccessProps) => (
  <BaseAlert className="border-emerald-600/80 bg-emerald-500 dark:bg-emerald-800">
    {title && <BaseAlert.Title className="text-white">{title}</BaseAlert.Title>}

    {children && (
      <BaseAlert.Description className="text-emerald-50 dark:text-emerald-200">
        {children}
      </BaseAlert.Description>
    )}
  </BaseAlert>
)
