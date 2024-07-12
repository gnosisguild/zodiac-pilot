import { describe, expect, it } from 'vitest'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { LegacyConnection } from '../types'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from './legacyConnectionMigrations'

describe('legacy connection migrations', () => {
  it('returns x for asLegacyConnection(fromLegacyConnection(x))', () => {
    const standard: LegacyConnection = {
      id: 'PnNZf8JmJTUCzeuS0kAwV',
      label: 'KPK Mainnet',
      chainId: 1,
      moduleAddress: '0xb89e3f01ead1906806597488ee5e089a0037f50c',
      avatarAddress: '0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c',
      pilotAddress: '0xe697903dc6ca014d3e17ba61f4daf657afd51561',
      providerType: 0,
      moduleType: KnownContracts.ROLES_V2,
      roleId:
        '0x4d414e4147455200000000000000000000000000000000000000000000000000',
      lastUsed: 1717492134,
      multisend: '0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761',
    }
    const standardMigrated = fromLegacyConnection(standard)!
    expect(asLegacyConnection(standardMigrated)).toEqual(standard)

    const noPilot: LegacyConnection = {
      id: 'bxY85cd9V24e8CvHBmwYo',
      label: 'Gnosis DAO Mainnet',
      chainId: 1,
      moduleAddress: '0x1cfb0cd7b1111bf2054615c7c491a15c4a3303cc',
      avatarAddress: '0x849d52316331967b6ff1198e5e32a0eb168d039d',
      pilotAddress: '',
      providerType: 0,
      roleId: '1',
      lastUsed: 1719582404,
      moduleType: KnownContracts.ROLES_V1,
      multisend: '0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761',
    }
    const noPilotMigrated = fromLegacyConnection(noPilot)!
    expect(asLegacyConnection(noPilotMigrated)).toEqual(noPilot)

    const noModule: LegacyConnection = {
      id: 'PnNZf8JmJTUCzeuS0kAwV',
      label: 'KPK Mainnet',
      chainId: 1,
      moduleAddress: '',
      avatarAddress: '0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c',
      pilotAddress: '0xe697903dc6ca014d3e17ba61f4daf657afd51561',
      providerType: 0,
      lastUsed: 1717492134,
    }
    const noModuleMigrated = fromLegacyConnection(noModule)!
    expect(asLegacyConnection(noModuleMigrated)).toEqual(noModule)
  })
})
