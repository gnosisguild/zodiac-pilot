import { CircleDollarSign } from 'lucide-react'
import type { PropsWithChildren } from 'react'

type TokenProps = PropsWithChildren<{ logo?: string }>

export const Token = ({ children, logo }: TokenProps) => (
  <div className="flex items-center gap-2">
    {logo ? (
      <img src={logo} alt="" className="size-4 rounded-full" />
    ) : (
      <div className="flex size-4 items-center justify-center">
        <CircleDollarSign size={16} className="opacity-50" />
      </div>
    )}

    {children}
  </div>
)
