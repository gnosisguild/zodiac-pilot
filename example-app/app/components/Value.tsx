import { PropsWithChildren } from 'react'

type ValueProps = PropsWithChildren<{ label: string }>

export const Value = ({ label, children }: ValueProps) => (
  <div className="flex items-center gap-2 text-xs leading-none text-gray-500">
    <span className="font-semibold uppercase">{label}</span>

    {children}
  </div>
)
