import { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type InfoProps = PropsWithChildren<{ title?: string }>

export const Info = ({ title, children }: InfoProps) => (
  <BaseAlert className="border-gray-200/80 bg-gray-100 dark:border-zinc-600/80 dark:bg-zinc-800">
    {title && (
      <BaseAlert.Title className="text-gray-700 dark:text-white">
        {title}
      </BaseAlert.Title>
    )}
    {children && (
      <BaseAlert.Description className="text-gray-500 dark:text-zinc-200">
        {children}
      </BaseAlert.Description>
    )}
  </BaseAlert>
)
