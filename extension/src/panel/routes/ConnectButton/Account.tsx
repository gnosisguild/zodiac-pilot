import { Circle, RawAddress } from '@/components'
import { validateAddress } from '@/utils'
import { ProviderType } from '../../../types'
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

      <RawAddress>{validateAddress(children)}</RawAddress>
    </div>
  )
}
