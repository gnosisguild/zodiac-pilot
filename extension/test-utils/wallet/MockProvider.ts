import type { Eip1193Provider } from '@/types'
import { invariant } from '@epic-web/invariant'
import { toBeHex } from 'ethers'
import EventEmitter from 'events'
import { splitPrefixedAddress, type PrefixedAddress } from 'ser-kit'
import { vi, type MockedFunction } from 'vitest'

export class MockProvider extends EventEmitter implements Eip1193Provider {
  request: MockedFunction<Eip1193Provider['request']>

  constructor() {
    super()

    this.request = vi.fn().mockResolvedValue(null)
  }

  makeReady(account: PrefixedAddress) {
    const [chainId, acccountAddress] = splitPrefixedAddress(account)

    invariant(chainId != null, `Could not parse chain ID from "${account}".`)

    this.emit('accountsChanged', [acccountAddress])
    this.emit('chainChanged', toBeHex(chainId))
    this.emit('readyChanged', true)
  }
}
