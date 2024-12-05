import { MODULE_NAMES } from '@/const'
import { LegacyConnection } from '@/types'
import { Address } from './Address'

interface Props {
  connection: LegacyConnection
}

export const ConnectionStack = ({ connection }: Props) => {
  const { avatarAddress, moduleAddress, pilotAddress, moduleType } = connection
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">Pilot Account</div>

        <Address address={pilotAddress} />
      </div>

      {moduleAddress && (
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {(moduleType && MODULE_NAMES[moduleType]) || 'Zodiac'} Mod
          </div>

          <Address address={moduleAddress} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">Piloted Safe</div>

        <Address address={avatarAddress} />
      </div>
    </div>
  )
}
