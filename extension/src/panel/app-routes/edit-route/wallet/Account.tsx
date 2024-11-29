import { Address } from '@/components'
import { validateAddress } from '@/utils'

type AccountProps = {
  children: string
}

export const Account = ({ children }: AccountProps) => {
  return (
    <div className="flex items-center gap-4 overflow-hidden">
      <Address allowCopy>{validateAddress(children)}</Address>
    </div>
  )
}
