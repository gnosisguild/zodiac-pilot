import { RawAddress } from '@/components'
import { validateAddress } from '@/utils'
import { ProviderType } from '../../../types'
import { ProviderLogo } from './ProviderLogo'

type AccountProps = {
  providerType: ProviderType
  children: string
}

export const Account = ({ providerType, children }: AccountProps) => {
  return (
    <div className="flex items-center gap-4 overflow-hidden">
      <div className="relative flex size-12 flex-shrink-0 items-center justify-center rounded-full border border-zodiac-dark-green">
        <ProviderLogo providerType={providerType} />
      </div>

      <RawAddress>{validateAddress(children)}</RawAddress>
    </div>
  )
}
