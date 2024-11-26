import { PropsWithChildren } from 'react'
import { BaseAlert } from './BaseAlert'

type InfoProps = PropsWithChildren<{ title?: string }>

export const Info = ({ title, children }: InfoProps) => (
  <BaseAlert className="border-zinc-600/80 bg-zinc-800">
    {title && <BaseAlert.Title className="text-white">{title}</BaseAlert.Title>}
    {children && (
      <BaseAlert.Description className="text-zinc-200">
        {children}
      </BaseAlert.Description>
    )}
  </BaseAlert>
)
