import { Address, Circle } from '@/components'
import { ProviderType } from '@/types'
import { validateAddress } from '@/utils'
import { ProviderLogo } from './providerLogo'

type AccountProps = {
  providerType: ProviderType
  children: string
}

export const Account = ({ providerType, children }: AccountProps) => {
  return (
    <div className="flex items-center gap-4 overflow-hidden">
      <Circle>
        <ProviderLogo providerType={providerType} />
      </Circle>

      <Address>{validateAddress(children)}</Address>
    </div>
  )
}
