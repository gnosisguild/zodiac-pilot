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
    expect(standardMigrated).toMatchInlineSnapshot(`
      {
        "_migratedFromLegacyConnection": true,
        "avatar": "eth:0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
        "id": "PnNZf8JmJTUCzeuS0kAwV",
        "initiator": "eth:0xe697903dc6ca014d3e17ba61f4daf657afd51561",
        "label": "KPK Mainnet",
        "lastUsed": 1717492134,
        "providerType": 0,
        "waypoints": [
          {
            "account": {
              "address": "0xe697903dc6ca014d3e17ba61f4daf657afd51561",
              "chain": 1,
              "prefixedAddress": "eth:0xe697903dc6ca014d3e17ba61f4daf657afd51561",
              "threshold": NaN,
              "type": "SAFE",
            },
          },
          {
            "account": {
              "address": "0xb89e3f01ead1906806597488ee5e089a0037f50c",
              "chain": 1,
              "multisend": [
                "0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761",
              ],
              "prefixedAddress": "eth:0xb89e3f01ead1906806597488ee5e089a0037f50c",
              "type": "ROLES",
              "version": 2,
            },
            "connection": {
              "from": "eth:0xe697903dc6ca014d3e17ba61f4daf657afd51561",
              "roles": [
                "0x4d414e4147455200000000000000000000000000000000000000000000000000",
              ],
              "type": "IS_MEMBER",
            },
          },
          {
            "account": {
              "address": "0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
              "chain": 1,
              "prefixedAddress": "eth:0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
              "threshold": NaN,
              "type": "SAFE",
            },
            "connection": {
              "from": "eth:0xb89e3f01ead1906806597488ee5e089a0037f50c",
              "type": "IS_ENABLED",
            },
          },
        ],
      }
    `)
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
    expect(noPilotMigrated).toMatchInlineSnapshot(`
      {
        "_migratedFromLegacyConnection": true,
        "avatar": "eth:0x849d52316331967b6ff1198e5e32a0eb168d039d",
        "id": "bxY85cd9V24e8CvHBmwYo",
        "initiator": undefined,
        "label": "Gnosis DAO Mainnet",
        "lastUsed": 1719582404,
        "providerType": 0,
        "waypoints": undefined,
      }
    `)
    expect(asLegacyConnection(noPilotMigrated)).toEqual({
      id: 'bxY85cd9V24e8CvHBmwYo',
      label: 'Gnosis DAO Mainnet',
      chainId: 1,
      avatarAddress: '0x849d52316331967b6ff1198e5e32a0eb168d039d',
      pilotAddress: '',
      moduleAddress: '',
      providerType: 0,
      lastUsed: 1719582404,
    })

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
    expect(noModuleMigrated).toMatchInlineSnapshot(`
      {
        "_migratedFromLegacyConnection": true,
        "avatar": "eth:0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
        "id": "PnNZf8JmJTUCzeuS0kAwV",
        "initiator": "eth:0xe697903dc6ca014d3e17ba61f4daf657afd51561",
        "label": "KPK Mainnet",
        "lastUsed": 1717492134,
        "providerType": 0,
        "waypoints": [
          {
            "account": {
              "address": "0xe697903dc6ca014d3e17ba61f4daf657afd51561",
              "chain": 1,
              "prefixedAddress": "eth:0xe697903dc6ca014d3e17ba61f4daf657afd51561",
              "threshold": NaN,
              "type": "SAFE",
            },
          },
          {
            "account": {
              "address": "0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
              "chain": 1,
              "prefixedAddress": "eth:0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
              "threshold": NaN,
              "type": "SAFE",
            },
            "connection": {
              "from": "eth:0xe697903dc6ca014d3e17ba61f4daf657afd51561",
              "type": "OWNS",
            },
          },
        ],
      }
    `)
    expect(asLegacyConnection(noModuleMigrated)).toEqual(noModule)
  })
})
