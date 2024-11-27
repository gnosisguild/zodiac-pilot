import { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type WarningProps = PropsWithChildren<{
  title?: string
}>

export const Warning = ({ children, title }: WarningProps) => (
  <BaseAlert className="border-amber-600/80 bg-amber-500 dark:border-yellow-600/80 dark:bg-yellow-800">
    {title && <BaseAlert.Title className="text-white">{title}</BaseAlert.Title>}

    {children && (
      <BaseAlert.Description className="text-amber-50 dark:text-yellow-200">
        {children}
      </BaseAlert.Description>
    )}
  </BaseAlert>
)
