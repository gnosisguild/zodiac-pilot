import type { LegacyConnection } from '@/types'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { describe, expect, it } from 'vitest'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from './legacyConnectionMigrations'

describe('legacy connection migrations', () => {
  it('returns x for asLegacyConnection(fromLegacyConnection(x))', () => {
    const standard: LegacyConnection = {
      id: 'PnNZf8JmJTUCzEuS0kAwV',
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
        "avatar": "eth:0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
        "id": "PnNZf8JmJTUCzEuS0kAwV",
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
        "avatar": "eth:0x849d52316331967b6ff1198e5e32a0eb168d039d",
        "id": "bxY85cd9V24e8CvHBmwYo",
        "initiator": "eth:0x0000000000000000000000000000000000000000",
        "label": "Gnosis DAO Mainnet",
        "lastUsed": 1719582404,
        "providerType": 0,
        "waypoints": [
          {
            "account": {
              "address": "0x0000000000000000000000000000000000000000",
              "chain": 1,
              "prefixedAddress": "eth:0x0000000000000000000000000000000000000000",
              "threshold": NaN,
              "type": "SAFE",
            },
          },
          {
            "account": {
              "address": "0x1cfb0cd7b1111bf2054615c7c491a15c4a3303cc",
              "chain": 1,
              "multisend": [
                "0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761",
              ],
              "prefixedAddress": "eth:0x1cfb0cd7b1111bf2054615c7c491a15c4a3303cc",
              "type": "ROLES",
              "version": 1,
            },
            "connection": {
              "from": "eth:0x0000000000000000000000000000000000000000",
              "roles": [
                "1",
              ],
              "type": "IS_MEMBER",
            },
          },
          {
            "account": {
              "address": "0x849d52316331967b6ff1198e5e32a0eb168d039d",
              "chain": 1,
              "prefixedAddress": "eth:0x849d52316331967b6ff1198e5e32a0eb168d039d",
              "threshold": NaN,
              "type": "SAFE",
            },
            "connection": {
              "from": "eth:0x1cfb0cd7b1111bf2054615c7c491a15c4a3303cc",
              "type": "IS_ENABLED",
            },
          },
        ],
      }
    `)
    expect(asLegacyConnection(noPilotMigrated)).toMatchInlineSnapshot(`
      {
        "avatarAddress": "0x849d52316331967b6ff1198e5e32a0eb168d039d",
        "chainId": 1,
        "id": "bxY85cd9V24e8CvHBmwYo",
        "label": "Gnosis DAO Mainnet",
        "lastUsed": 1719582404,
        "moduleAddress": "0x1cfb0cd7b1111bf2054615c7c491a15c4a3303cc",
        "moduleType": "roles_v1",
        "multisend": "0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761",
        "multisendCallOnly": undefined,
        "pilotAddress": "",
        "providerType": 0,
        "roleId": "1",
      }
    `)

    const noModule: LegacyConnection = {
      id: 'PnNZf8JmJTUCzEuS0kAwV',
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
        "avatar": "eth:0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c",
        "id": "PnNZf8JmJTUCzEuS0kAwV",
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

  it('migrates connections without a pilot address', () => {
    expect(
      fromLegacyConnection({
        id: '28KuFy7mBqI1lQdOs5KgE',
        label: 'test',
        moduleAddress: '0x53253c670e079274e13a5e1b462e7f6e8b6a4b40',
        avatarAddress: '0xd0ca2a7ed8aee7972750b085b27350f1cd387f9b',
        pilotAddress: '',
        chainId: 1,
        providerType: 1,
        moduleType: KnownContracts.ROLES_V2,
      }),
    ).toMatchInlineSnapshot(`
      {
        "avatar": "eth:0xd0ca2a7ed8aee7972750b085b27350f1cd387f9b",
        "id": "28KuFy7mBqI1lQdOs5KgE",
        "initiator": "eoa:0x0000000000000000000000000000000000000000",
        "label": "test",
        "lastUsed": undefined,
        "providerType": 1,
        "waypoints": [
          {
            "account": {
              "address": "0x0000000000000000000000000000000000000000",
              "prefixedAddress": "eoa:0x0000000000000000000000000000000000000000",
              "type": "EOA",
            },
          },
          {
            "account": {
              "address": "0x53253c670e079274e13a5e1b462e7f6e8b6a4b40",
              "chain": 1,
              "multisend": [],
              "prefixedAddress": "eth:0x53253c670e079274e13a5e1b462e7f6e8b6a4b40",
              "type": "ROLES",
              "version": 2,
            },
            "connection": {
              "from": "eoa:0x0000000000000000000000000000000000000000",
              "roles": [],
              "type": "IS_MEMBER",
            },
          },
          {
            "account": {
              "address": "0xd0ca2a7ed8aee7972750b085b27350f1cd387f9b",
              "chain": 1,
              "prefixedAddress": "eth:0xd0ca2a7ed8aee7972750b085b27350f1cd387f9b",
              "threshold": NaN,
              "type": "SAFE",
            },
            "connection": {
              "from": "eth:0x53253c670e079274e13a5e1b462e7f6e8b6a4b40",
              "type": "IS_ENABLED",
            },
          },
        ],
      }
    `)
  })
})
