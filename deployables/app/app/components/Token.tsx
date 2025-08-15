import { type PropsWithChildren } from 'react'
import { TokenIcon, TokenIconProps } from './TokenIcon'

type TokenProps = PropsWithChildren<TokenIconProps>

export const Token = ({ children, ...props }: TokenProps) => (
  <div className="flex items-center gap-2 overflow-hidden">
    <TokenIcon {...props} />

    <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
      {children}
    </span>
  </div>
)
