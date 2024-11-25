import { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type WarningProps = PropsWithChildren<{
  title?: string
}>

export const Warning = ({ children, title }: WarningProps) => (
  <BaseAlert className="border-yellow-600/80 bg-yellow-800">
    {title && <BaseAlert.Title className="text-white">{title}</BaseAlert.Title>}

    {children && (
      <BaseAlert.Description className="text-yellow-200">
        {children}
      </BaseAlert.Description>
    )}
  </BaseAlert>
)
